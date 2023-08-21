function returnEsId(_id) {
    const stringId = _id.toString().slice(-5);
    const esId = parseInt(stringId, 16) % 1e6;
    return esId;
}

export default returnEsId;
