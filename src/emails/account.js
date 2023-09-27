const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.PASS_KEYS_FOR_SENDEMAIL,
    },
});

// async..await is not allowed in global scope, must use a wrapper
async function sendWelcomeEmail(email, name) {
    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: process.env.EMAIL_ADDRESS, // sender address
        to: email, // list of receivers
        subject: "Thanks for joining with us.!", // Subject line
        text: `Welcome to the app, ${name}. have a great expirence ahed.!`, // plain text body
    });
    //console.log("Message sent: %s", info.messageId);
}

async function sendDeleteAccountEmail(email, name) {
    const info = await transporter.sendMail({
        from: process.env.EMAIL_ADDRESS,
        to: email,
        subject: `Good Bye ${name}, hopefully you enjoy the journey`,
        text: `can i know why you leave?`,
    });
    console.log(info.messageId);
}

module.exports = {
    sendWelcomeEmail,
    sendDeleteAccountEmail
}