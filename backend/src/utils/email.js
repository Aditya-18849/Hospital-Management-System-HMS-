import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// 1. Create Transporter (Provider Agnostic)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT), // Ensure port is a number
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Fix for "self-signed certificate in certificate chain" error
  tls: {
    rejectUnauthorized: false
  }
});

// 2. Verify Connection (Production Grade Debugging)
// This will log to your console if the SMTP connection is successful or fails
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email Service Error:", error);
  } else {
    console.log("✅ Email Service Ready (SMTP Connected)");
  }
});

const sendEmail = async (options) => {
  try {
    // 3. Define Email Options
    const mailOptions = {
      from: `"HMS Support" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #1976d2;">Hospital Management System</h2>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
            <h3 style="color: #333;">Hello, ${options.name || 'User'}</h3>
            <p style="color: #555; font-size: 16px;">
              ${options.message || 'Thank you for registering with us.'}
            </p>
            
            ${options.url ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${options.url}" style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Activate Account
              </a>
            </div>
            <p style="color: #999; font-size: 14px;">
              Or verify by copying this link:<br>
              <a href="${options.url}" style="color: #1976d2;">${options.url}</a>
            </p>
            ` : ''}
            
          </div>
          <div style="margin-top: 20px; text-align: center; color: #aaa; font-size: 12px;">
            &copy; ${new Date().getFullYear()} HMS Platform. All rights reserved.
          </div>
        </div>
      `,
    };

    // 4. Send Email
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    return info;
    
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Re-throw to be handled by the controller
  }
};

export default sendEmail;