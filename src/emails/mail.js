const mailDriver = process.env.MAIL_DRIVER;
const mail = require(`./drivers/${mailDriver}.js`);

module.exports = mail;
