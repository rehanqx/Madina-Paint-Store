import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { sendEmail, getBookingConfirmationTemplate, getAdminBookingNotificationTemplate } from '@/lib/emailService';

export async function GET() {
  try {
    const bookingsRef = collection(db, 'bookings');
    const querySnapshot = await getDocs(bookingsRef);
    const bookings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(bookings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, phone, email, address, serviceType, bookingDate, bookingTime } = body;

    // Validate required fields
    if (!customerName || !phone || !email || !serviceType || !bookingDate || !bookingTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add booking to Firestore
    const bookingsRef = collection(db, 'bookings');
    const docRef = await addDoc(bookingsRef, {
      customerName,
      phone,
      email,
      address: address || '',
      serviceType,
      bookingDate,
      bookingTime,
      status: 'pending',
      notes: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('Booking created:', docRef.id);

    // Send confirmation email to customer (asynchronously, do not await)
    const customerEmailTemplate = getBookingConfirmationTemplate(
      customerName,
      serviceType,
      bookingDate,
      bookingTime,
      process.env.NEXT_PUBLIC_SHOP_PHONE || '+92 300 1234567'
    );

    sendEmail({
      to: email,
      subject: 'Booking Confirmation - Paint Shop',
      html: customerEmailTemplate,
    }).catch(err => console.error('Error sending customer confirmation email:', err));

    // Send notification email to admin (asynchronously, do not await)
    const adminEmail = process.env.NODEMAILER_ADMIN_EMAIL;
    if (adminEmail) {
      const adminEmailTemplate = getAdminBookingNotificationTemplate(
        customerName,
        phone,
        email,
        serviceType,
        bookingDate,
        bookingTime,
        address || 'N/A'
      );

      sendEmail({
        to: adminEmail,
        subject: 'New Booking - Paint Shop Admin',
        html: adminEmailTemplate,
      }).catch(err => console.error('Error sending admin notification email:', err));
    }

    return NextResponse.json(
      { success: true, bookingId: docRef.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}
