var QuickBlox = require('quickblox').QuickBlox;

exports.init = function (callback) {
    var CREDENTIALS = {
        appId: process.env.QBLOX_APP_ID,
        authKey: process.env.QBLOX_APP_KEY,
        authSecret: process.env.QBLOX_APP_SECRET
    };

    console.log('CREDENTIALS', CREDENTIALS)

    const QB = new QuickBlox();
    QB.init(CREDENTIALS.appId, CREDENTIALS.authKey, CREDENTIALS.authSecret);
    var params = { login: "hkxicor", password: "a$123456" };
    QB.createSession(params, function (err) {
        callback({ qb: QB, err });
    });
}