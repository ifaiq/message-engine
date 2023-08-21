/**
* EqualObjectIds misc
* @module
*/
import isValidObjectId from './isValidObjectId.js';

function equalObjectIds(id1, id2) {
    return isValidObjectId(id1) && isValidObjectId(id2) && id1.toString() === id2.toString();
}

export default equalObjectIds;
