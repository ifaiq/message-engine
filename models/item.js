import mongoose from 'mongoose';
import Order from './order.js';

const itemSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Post',
        index: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    },
    location: {
        type: String,
        enum: ['seller', 'buyer', 'SP', 'deliveryMan'],
        required: true,
    },
    status: {
        type: String,
        enum: [
            'available',
            'availableInSP',
            'cancelled',
            'pendingDelivery',
            'pickedForDelivery',
            'cancelledOnDelivery',
            'rejectedByBuyer',
            'rejectedBySp',
            'returnAccepted',
            'returnPending',
            'returnRejected',
            'sold',
            'waitingBuyerContact',
            'waitingDescripChange',
            'waitingDropOff',
            'waitingPickUp',
            'waitingSellerPayment',
            'pendingTransit', // pending to be picked up from sp1 to be transited to sp2
            'onTransit', // picked up from sp1 and on its way to sp2
        ],
        required: true,
        set(status) {
            this._previousStatus = this.status;
            return status;
        },
    },
    transitionDeadline: {
        type: Date,
        required() {
            return this.status === 'pendingTransit' || this.status === 'onTransit';
        },
    },
    price: { // post.price - post.discount.discount_amount
        type: Number,
        min: 0.25,
    },
    commissionAndVAT: {
        commission: {
            type: Number,
            default: 0,
            min: 0,
            max: 1,
        },
        VAT: {
            type: Number,
            default: 0,
            min: 0,
            max: 1,
        },
    },
    buyerInspection: {
        isAccepted: Boolean,
        notes: String,
    },
    SP: { // sp that item is currently at
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service Point',
    },
    destinationSP: { // sp the item should be transited to
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service Point',
        required() { // required if item is pending or on transit
            return (
                this.status === 'pendingTransit' || this.status === 'onTransit'
            );
        },
    },
    trackingId: { // entered by SP agent when item is picked up from sp to be transited
        type: String,
    },
    shelf: {
        type: String,
        set(shelf) {
            this._previousShelf = this.shelf;
            return shelf;
        },
    },
    shelfHistory: [
        {
            shelf: {
                type: String,
            },
            replaceDate: {
                type: Date,
            },
        },
    ],
    charging: {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        SP: { type: mongoose.Schema.Types.ObjectId, ref: 'Service Point' },
        NoChargePeriodStartDate: { // Save the time the user chose to pick up the item, to start calculating the no-charge period from that date.
            type: Date,
        },
        paid: {
            type: Boolean,
            default: false,
        },
        stopChargingDate: {
            type: Date,
        },
        isPropertyTransferred: {
            type: Boolean,
            default: false,
        },
        soFarDays: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
});

itemSchema.set('timestamps', true);

itemSchema.pre('save', function run(next) {
    this.previousStatus = this._previousStatus;
    if (this.isModified('shelf') && this.shelf !== this._previousShelf) {
        this.shelfHistory.push(
            {
                shelf: this._previousShelf,
                replaceDate: Date.now(),
            },
        );
    }
    if (this.isModified('status')) {
        if (this.status === 'pickedForDelivery') {
            this.location = 'deliveryMan';
        }
        if (this.status === 'cancelledOnDelivery') {
            this.destinationSP = this.SP;
        }
    }
    return next();
});
itemSchema.post('save', async function next() {
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
        if (this.status !== this.previousStatus) {
            const deliveryStatuses = ['pendingDelivery', 'pickedForDelivery', 'cancelledOnDelivery'];
            // resynchronize orders if status changed to/from on of the delivery statuses to appear in the orders filters
            if (deliveryStatuses.includes(this.status) || deliveryStatuses.includes(this.previousStatus)) {
                Order.synchronize({ items: { $elemMatch: { $in: [this._id] } } });
            }
        }
    }
});

const Item = mongoose.model('Item', itemSchema);
export default Item;
