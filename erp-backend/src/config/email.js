const nodemailer = require('nodemailer');

// Create transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'medineoenterprises@gmail.com',
    pass: process.env.EMAIL_PASSWORD // Gmail App Password (not regular password)
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('Email configuration error:', error.message);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Send inquiry notification email
const sendInquiryNotification = async (inquiry) => {
  const mailOptions = {
    from: `"Medineo Website" <${process.env.EMAIL_USER || 'medineoenterprises@gmail.com'}>`,
    to: 'medineoenterprises@gmail.com',
    subject: `New Inquiry: ${inquiry.subject || 'Website Contact Form'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px;">
          <h1 style="margin: 0; font-size: 24px;">📩 New Inquiry Received</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Medineo Enterprises Website</p>
        </div>
        
        <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Contact Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 120px; color: #555;">Name:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">${inquiry.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Email:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">
              <a href="mailto:${inquiry.email}" style="color: #667eea;">${inquiry.email || 'Not provided'}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Phone:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">
              <a href="tel:${inquiry.phone}" style="color: #667eea;">${inquiry.phone}</a>
            </td>
          </tr>
          ${inquiry.company ? `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Company:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">${inquiry.company}</td>
          </tr>
          ` : ''}
          ${inquiry.city || inquiry.state ? `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Location:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">${[inquiry.city, inquiry.state].filter(Boolean).join(', ')}</td>
          </tr>
          ` : ''}
        </table>
        
        ${inquiry.subject ? `
        <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-top: 25px;">Subject</h2>
        <p style="color: #333; background: #f9f9f9; padding: 15px; border-radius: 5px;">${inquiry.subject}</p>
        ` : ''}
        
        <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-top: 25px;">Message</h2>
        <div style="color: #333; background: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${inquiry.message}</div>
        
        <div style="margin-top: 30px; padding: 15px; background: #e8f4fd; border-radius: 5px; border-left: 4px solid #667eea;">
          <p style="margin: 0; color: #555; font-size: 14px;">
            <strong>📅 Received:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
          </p>
          <p style="margin: 5px 0 0 0; color: #555; font-size: 14px;">
            <strong>🔗 Source:</strong> ${inquiry.source || 'Website'}
          </p>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #888; font-size: 12px; text-align: center;">
          This is an automated notification from Medineo Enterprises website contact form.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Inquiry notification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending inquiry notification email:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  transporter,
  sendInquiryNotification
};
