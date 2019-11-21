var FCM = require('fcm-node');
var serverKey = 'AAAADofQIR0:APA91bEV8wfj8AvkktBrVvhlh_i017TkHwegKdMBquz_w9d4wli3zHGwYodZVHfnbBSrcS8_En0_hhLiJCbadURYVSc1eIomizWSDVPMk7mHQBQ9xTlvZ3-zy4L3Kw86hse_29yuM7Pt'; // put your server key here
var fcm = new FCM(serverKey);

function sendNotification(title, body, registration_ids = [], data = {}) {
    var message = {
        registration_ids: registration_ids, // Multiple tokens in an array
        collapse_key: '',

        notification: {
            title: title,
            body: body
        },

        data: data
    };

    fcm.send(message, function (err, response) {
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
}

module.exports = sendNotification;