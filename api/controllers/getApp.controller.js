const sendSMS = require('../../utils/send-sms');

exports.get_app = async (req, res) => {
    const mobile = req.query['mobile'];
    const appLink = 'https://www.gameplex.app';

    sendSMS(mobile, '<#> Welcome to gameplex, \n Here is your link to download the App. OTP 0000\n\n ' + appLink);

    res.status(201).json({
        success: true,
    })
}