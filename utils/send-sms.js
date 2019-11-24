const https = require('https');
const authKey = '235391AG8E7NoOgG5b8d4843';

function sendSMS(mobile, template) {
    https.get(encodeURI(`https://api.msg91.com/api/sendhttp.php?mobiles=91${mobile}&authkey=${authKey}&route=4&sender=PROCKT&message=${template}&country=91`), (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
            console.log('data', data)
        });
    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

module.exports = sendSMS;
