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

// Email template: Booking status update
export function getBookingStatusUpdateTemplate(
  customerName: string,
  serviceType: string,
  bookingDate: string,
  bookingTime: string,
  status: 'confirmed' | 'completed' | 'cancelled' | 'rescheduled' | string,
  notes?: string
) {
  let statusColor = '#2D5016'; // green
  let statusLabel = status.toUpperCase();

  if (status === 'confirmed') {
    statusColor = '#1D4ED8'; // blue
  } else if (status === 'cancelled') {
    statusColor = '#DC2626'; // red
  } else if (status === 'rescheduled') {
    statusColor = '#D97706'; // orange/amber
  }

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: ${statusColor}; color: white; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Madina Paint Store</h1>
        <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Booking Status Update: ${statusLabel}</p>
      </div>
      
      <div style="padding: 24px; background-color: #f9f9f9; color: #333333;">
        <p style="font-size: 16px; margin-top: 0;">Dear <strong>${customerName}</strong>,</p>
        
        <p>The status of your service booking has been updated to: <strong style="color: ${statusColor};">${statusLabel}</strong>.</p>
        
        <div style="background-color: white; padding: 20px; border-left: 4px solid ${statusColor}; margin: 20px 0; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <p style="margin: 0 0 8px 0;"><strong>Service Type:</strong> ${serviceType}</p>
          <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${bookingDate}</p>
          <p style="margin: 0 0 8px 0;"><strong>Time Slot:</strong> ${bookingTime}</p>
          <p style="margin: 0;"><strong>Current Status:</strong> <span style="color: ${statusColor}; font-weight: bold; text-transform: uppercase;">${statusLabel}</span></p>
        </div>
        
        ${notes ? `
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0; font-size: 14px;">
          <p style="margin: 0 0 4px 0; font-weight: bold; color: #4b5563;">Update Notes:</p>
          <p style="margin: 0; color: #1f2937; font-style: italic;">${notes.replace(/\\n/g, '<br>')}</p>
        </div>
        ` : ''}
        
        <p>If you have any questions or need to make further adjustments, feel free to reply to this email or contact us.</p>
        
        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #999999; font-size: 12px;">
          <p style="margin: 0;">&copy; 2026 Madina Paint Store. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;
}

// Email template: Customer Inquiry Reply
export function getCustomerReplyTemplate(
  customerName: string,
  originalMessage: string,
  replyMessage: string
) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #2D5016; color: white; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Madina Paint Store</h1>
        <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Response to Your Inquiry</p>
      </div>
      
      <div style="padding: 24px; background-color: #f9f9f9; color: #333333;">
        <p style="font-size: 16px; margin-top: 0;">Dear <strong>${customerName}</strong>,</p>
        
        <p>Thank you for contacting Madina Paint Store. Here is our response to your inquiry:</p>
        
        <div style="background-color: white; padding: 20px; border-left: 4px solid #2D5016; margin: 20px 0; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #2D5016;">Our Response:</p>
          <p style="margin: 0; white-space: pre-wrap; color: #111111; font-size: 15px; line-height: 1.5;">${replyMessage.replace(/\\n/g, '<br>')}</p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0; font-size: 13px; color: #555555;">
          <p style="margin: 0 0 4px 0; font-weight: bold;">Your Original Message:</p>
          <p style="margin: 0; font-style: italic;">"${originalMessage.replace(/\\n/g, '<br>')}"</p>
        </div>
        
        <p>If you have any further questions, feel free to reply to this email or call us.</p>
        
        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #999999; font-size: 12px;">
          <p style="margin: 0;">&copy; 2026 Madina Paint Store. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;
}
