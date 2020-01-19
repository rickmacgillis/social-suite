const cors = function (req, res, next) {

    if (process.env.APP_ENV !== 'dev') {
        return next();
    }

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*');
    next();

};

module.exports = cors;
