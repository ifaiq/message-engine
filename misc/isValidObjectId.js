/**
* IsValidObjectID misc
* @module
*/
import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

function isValidObjectId(id) {
    if (typeof id === 'object') return ObjectId.isValid(id);
    return ObjectId.isValid(id) && ((String)(new ObjectId(id)) === id);
}

export default isValidObjectId;
