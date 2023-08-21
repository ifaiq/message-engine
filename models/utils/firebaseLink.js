const firebaseLinkResolve = (fileName) => `https://firebasestorage.googleapis.com/v0/b/mazadat-firebase.appspot.com/o/Bulk_${process.env.NODE_ENV}%2F${fileName}?alt=media`;
export default firebaseLinkResolve;
