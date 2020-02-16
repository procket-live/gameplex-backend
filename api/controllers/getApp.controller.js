const sendSMS = require('../../utils/send-sms');

exports.get_app = async (req, res) => {
    const mobile = req.query['mobile'];

    const appLink = `http://onelink.to/qngvbc`;

    const result = await sendSMS(mobile, `Welcome to gameplex, \n Here is your link to donload app.\n ${appLink}`);

    res.status(201).json({
        success: true,
        result
    })
}