// emailer/services/mailService.js
const ejs = require('ejs');
const path = require('path');
const transporter = require('../config/mailer');
require('dotenv').config();

const sendEmail = async (templateName, data, to, subject, from) => {
  const templatePath = path.join(__dirname, `../templates/${templateName}.ejs`);
  
  const html = await ejs.renderFile(templatePath, data);

  const mailOptions = {
    from: from || process.env.EMAIL_FROM,
    to: to,
    subject: subject,
    html: html,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Email sent to ${to} with subject "${subject}"`);
};

module.exports = { sendEmail };