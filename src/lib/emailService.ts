import nodemailer from 'nodemailer';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email provider
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD, // Use App Password for Gmail
  },
});

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(payload: EmailPayload) {
  try {
    const info = await transporter.sendMail({
      from: `Paint Shop <${process.env.NODEMAILER_EMAIL}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
    console.log('Email sent:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
}

// Email template: Booking confirmation
export function getBookingConfirmationTemplate(
  customerName: string,
  serviceType: string,
  bookingDate: string,
  bookingTime: string,
  shopPhone: string
) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #2D5016; color: white; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Madina Paint Store</h1>
        <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Service Booking Confirmation</p>
      </div>
      
      <div style="padding: 24px; background-color: #f9f9f9; color: #333333;">
        <p style="font-size: 16px; margin-top: 0;">Dear <strong>${customerName}</strong>,</p>
        
        <p>Thank you for booking with us! We have received your request. Here are the booking details:</p>
        
        <div style="background-color: white; padding: 20px; border-left: 4px solid #2D5016; margin: 20px 0; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <p style="margin: 0 0 8px 0;"><strong>Service Type:</strong> ${serviceType}</p>
          <p style="margin: 0 0 8px 0;"><strong>Proposed Date:</strong> ${bookingDate}</p>
          <p style="margin: 0;"><strong>Proposed Time Slot:</strong> ${bookingTime}</p>
        </div>
        
        <p>Our team will contact you shortly to confirm the appointment and discuss any custom matching or estimates.</p>
        
        <p style="margin-bottom: 0;">If you have any questions or need to reschedule, feel free to contact us:</p>
        <p style="margin-top: 4px;"><strong>Phone:</strong> ${shopPhone}</p>
        
        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #999999; font-size: 12px;">
          <p style="margin: 0;">&copy; 2026 Madina Paint Store. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;
}

// Email template: New booking notification for admin
export function getAdminBookingNotificationTemplate(
  customerName: string,
  phone: string,
  email: string,
  serviceType: string,
  bookingDate: string,
  bookingTime: string,
  address: string
) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #DC2626; color: white; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px;">New Booking Estimate Request</h1>
      </div>
      
      <div style="padding: 24px; background-color: #f9f9f9; color: #333333;">
        <p style="margin-top: 0; font-size: 15px;"><strong>A new service booking request has been received.</strong></p>
        
        <div style="background-color: white; padding: 20px; border-left: 4px solid #DC2626; margin: 20px 0; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <p style="margin: 0 0 8px 0;"><strong>Customer Name:</strong> ${customerName}</p>
          <p style="margin: 0 0 8px 0;"><strong>Phone:</strong> ${phone}</p>
          <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 0 0 8px 0;"><strong>Service:</strong> ${serviceType}</p>
          <p style="margin: 0 0 8px 0;"><strong>Requested Date:</strong> ${bookingDate}</p>
          <p style="margin: 0 0 8px 0;"><strong>Requested Time:</strong> ${bookingTime}</p>
          <p style="margin: 0;"><strong>Address:</strong> ${address}</p>
        </div>
        
        <p style="margin-bottom: 0;">Please log into the admin portal dashboard to manage and confirm this request.</p>
      </div>
    </div>
  `;
}

// Email template: Contact form submission
export function getContactFormTemplate(
  name: string,
  email: string,
  phone: string,
  message: string
) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #2D5016; color: white; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px;">New Customer Inquiry</h1>
      </div>
      
      <div style="padding: 24px; background-color: #f9f9f9; color: #333333;">
        <p style="margin-top: 0;">You have received a new contact inquiry:</p>
        
        <div style="background-color: white; padding: 20px; border-left: 4px solid #2D5016; margin: 20px 0; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <p style="margin: 0 0 8px 0;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 0 0 12px 0;"><strong>Phone:</strong> ${phone}</p>
          <p style="margin: 0 0 4px 0; font-weight: bold;">Message:</p>
          <p style="margin: 0; white-space: pre-wrap; font-style: italic; color: #555555;">${message.replace(/\n/g, '<br>')}</p>
        </div>
        
        <p style="margin-bottom: 0;">Please reply to the customer at your earliest convenience.</p>
      </div>
    </div>
  `;
}

// Email template: Admin welcome
export function getAdminWelcomeTemplate(adminEmail: string, password: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #2D5016; color: white; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Admin Access Credentials</h1>
      </div>
      
      <div style="padding: 24px; background-color: #f9f9f9; color: #333333;">
        <p style="margin-top: 0; font-size: 16px;">Welcome to the <strong>Madina Paint Store Admin Portal</strong>!</p>
        
        <p>An administrative account has been created for you. Here are your temporary login details:</p>
        
        <div style="background-color: white; padding: 20px; border-left: 4px solid #2D5016; margin: 20px 0; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <p style="margin: 0 0 8px 0;"><strong>Admin Email:</strong> ${adminEmail}</p>
          <p style="margin: 0 0 8px 0;"><strong>Temporary Password:</strong> ${password}</p>
          <p style="margin: 0;"><strong>Login Panel:</strong> <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" style="color: #2D5016; font-weight: bold; text-decoration: underline;">Open Admin Login Portal</a></p>
        </div>
        
        <p><strong>Security Warning:</strong> You must change your temporary password immediately upon your first login to keep the store portal secure.</p>
        
        <p style="margin-bottom: 0;">If you have any questions or experience login issues, please contact the developer.</p>
      </div>
    </div>
  `;
}
