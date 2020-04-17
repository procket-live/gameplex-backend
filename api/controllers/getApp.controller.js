const sendSMS = require('../../utils/send-sms');

exports.get_app = async (req, res) => {
    const mobile = req.query['mobile'];
    console.log('mobile', mobile);
    const appLink = 'https://firebasestorage.googleapis.com/v0/b/gameplex-5a29e.appspot.com/o/apk%2Fgameplex-2-4-21-1e632g94r.apk?alt=media&token=d5d8a434-4020-419e-a320-e227e147044a';

    sendSMS(mobile, '<#> Welcome to gameplex, \n Here is your link to download the App. OTP 0000\n\n ' + appLink);

    res.status(201).json({
        success: true,
    })
}