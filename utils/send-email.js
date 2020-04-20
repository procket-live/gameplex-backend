const nodemailer = require("nodemailer");

async function SendEmail(to, subject, text) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'jovanny.king31@ethereal.email',
            pass: 'KCVRJUpAJCd86nsZCe'
        }
    });

    return transporter.sendMail({
        from: 'admin@procket.live',
        to,
        subject,
        text
    });
}

exports.send_email = SendEmail;