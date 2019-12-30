const mail = require('@sendgrid/mail');

mail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {

    sendPasswordResetEmail(user) {

        mail.send({
            to: user.email,
            from: process.env.MAIL_FROM,
            subject: 'Password Reset',
            text: "Your password has been reset. If you didn't request this email, just ignore it.\n" +
                "To reset your password, please go to " + process.env.APP_URL + "/users/reset-password?token=" + user.passwordReset,
        });

    }

};
