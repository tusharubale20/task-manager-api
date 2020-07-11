const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'tusharubale20@gmail.com',
        subject: "Welcome to Tushar's Task App",
        text: `Welcome to the Task app, ${name}. Let me know how you feel about this app.`
    })
}

const sendCancellationMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'tusharubale20@gmail.com',
        subject: 'Task App Service cancellation',
        text: `Goodbye ${name}, I hope to see you back soon. I am glad that you tried this app. Please note that your information has been completely removed from thi app. Have a nice day ahead.`
    })
}

module.exports = {
    sendWelcomeMail,
    sendCancellationMail
}