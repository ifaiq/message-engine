import Affiliate from '../affiliate.js';
import OrderByAffiliate from '../orderByAffiliate.js';
import Post from '../post.js';

// Link affiliate to order if user checkout through affiliate link
async function userCheckedOutByAffiliate(user, order, items) {
    let posts = await Post.aggregate([
        {
            $lookup: {
                from: 'items',
                localField: '_id',
                foreignField: 'post',
                as: 'items',
            },
        }, {
            $match: {
                items: {
                    $elemMatch: {
                        _id: {
                            $in: items,
                        },
                    },
                },
            },
        }, {
            $project: {
                _id: 1,
            },
        },
    ]);
    posts = posts.map((obj) => obj._id);
    const affiliate = await Affiliate.find({ post: { $in: posts }, user }).lean();
    for (let i = 0; i < affiliate.length; i += 1) {
        const { affiliateId } = affiliate[i];
        const orderByAffiliate = new OrderByAffiliate({ order, affiliateId });
        await orderByAffiliate.save();
    }
}
export default userCheckedOutByAffiliate;
