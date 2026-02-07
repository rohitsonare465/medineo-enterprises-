require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

console.log('Testing email with:');
console.log('User:', process.env.EMAIL_USER);
console.log('Password length:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 'N/A');
console.log('Password has spaces:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.includes(' ') : 'N/A');

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Verification Failed:', error.message);
  } else {
    console.log('✅ Verification Success! Server is ready to take our messages');

    // Optional: Send a test mail
    /*
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Test Email",
      text: "This is a test email."
    }).then(info => console.log('Email sent:', info.messageId))
      .catch(err => console.error('Send failed:', err));
    */
  }
});
