import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, getBookingStatusUpdateTemplate } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, customerName, serviceType, bookingDate, bookingTime, status, notes } = body;

    if (!to || !customerName || !serviceType || !bookingDate || !bookingTime || !status) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const html = getBookingStatusUpdateTemplate(
      customerName,
      serviceType,
      bookingDate,
      bookingTime,
      status,
      notes || ''
    );

    const emailResult = await sendEmail({
      to,
      subject: `Booking Status Updated: ${status.toUpperCase()} - Paint Shop`,
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
