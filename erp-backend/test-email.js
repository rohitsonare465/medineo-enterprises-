require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Testing email configuration...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '****' + process.env.EMAIL_PASSWORD.slice(-4) : 'NOT SET');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('\n❌ Email configuration error:', error.message);
    console.log('\nPossible fixes:');
    console.log('1. Make sure 2-Step Verification is enabled on Gmail');
    console.log('2. Generate a new App Password at: https://myaccount.google.com/apppasswords');
    console.log('3. Update EMAIL_PASSWORD in .env with the new App Password');
  } else {
    console.log('\n✅ Email server is ready!');
    
    // Send test email
    transporter.sendMail({
      from: `"Medineo Test" <${process.env.EMAIL_USER}>`,
      to: 'medineoenterprises@gmail.com',
      subject: 'Test Email - Medineo Enterprises',
      text: 'This is a test email from Medineo ERP. If you receive this, email is working correctly!',
      html: '<h2>Test Email</h2><p>This is a test email from <strong>Medineo ERP</strong>. If you receive this, email is working correctly!</p>'
    })
    .then(info => {
      console.log('📧 Test email sent successfully!');
      console.log('Message ID:', info.messageId);
      process.exit(0);
    })
    .catch(err => {
      console.log('❌ Failed to send test email:', err.message);
      process.exit(1);
    });
  }
});
