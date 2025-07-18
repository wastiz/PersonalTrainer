const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, //true for 465
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
})

const mailOptions = {
    from: {
        name: "Stanislav Jagutkin Fitness",
        address: process.env.MAIL_USER,
    },
    to: ['stanislavjagutkin@gmail.com'],
    subject: `Uus bronering`,
    text: ''

}

const sendMail = async (text) => {
    try {
        mailOptions.text = text
        await transporter.sendMail(mailOptions);
        mailOptions.text = ''
        console.log('email sent')
    } catch (error) {
        console.error(error);
    }
}

module.exports = {sendMail}