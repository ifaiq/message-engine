/**
* Routes Top module
* @module
*/

export default (app) => {
    app.use('/api', (req, res) => { res.status(200).send({ status: 200 }); });
};
