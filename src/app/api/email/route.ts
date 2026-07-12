import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, getBookingStatusUpdateTemplate, getCustomerReplyTemplate } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      to,
      customerName,
      serviceType,
      bookingDate,
      bookingTime,
      status,
      notes,
      originalMessage,
      replyMessage,
    } = body;

    if (!to || !customerName) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    let html = '';
    let subject = '';

    if (type === 'contact_reply') {
      if (!originalMessage || !replyMessage) {
        return NextResponse.json(
          { error: 'Missing contact reply message fields' },
          { status: 400 }
        );
      }
      html = getCustomerReplyTemplate(customerName, originalMessage, replyMessage);
      subject = `Reply to your Inquiry - Madina Paint Store`;
    } else {
      if (!serviceType || !bookingDate || !bookingTime || !status) {
        return NextResponse.json(
          { error: 'Missing booking status update fields' },
          { status: 400 }
        );
      }
      html = getBookingStatusUpdateTemplate(
        customerName,
        serviceType,
        bookingDate,
        bookingTime,
        status,
        notes || ''
      );
      subject = `Booking Status Updated: ${status.toUpperCase()} - Paint Shop`;
    }

    const emailResult = await sendEmail({
      to,
      subject,
      html,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send email via SMTP transporter' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, messageId: emailResult.messageId });
  } catch (error: any) {
    console.error('API Email error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
