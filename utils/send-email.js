const nodemailer = require("nodemailer");

async function SendEmail(to, subject, text) {
    let testAccount = await nodemailer.createTestAccount();
    
    const config = {
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    }
    console.log('sccc', config);
    const transporter = nodemailer.createTransport(config);

    return transporter.sendMail({
        from: 'admin@procket.live',
        to,
        subject,
        text
    });
}

module.exports = SendEmail;