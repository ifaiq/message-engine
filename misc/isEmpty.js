/**
* IsEmpty misc
* @module
*/
import _ from 'lodash';
import mongoose from 'mongoose';

function isEmpty(obj) {
    const object = obj instanceof mongoose.Document ? obj.toObject() : obj;
    return _.isEmpty(object);
}

export default isEmpty;
