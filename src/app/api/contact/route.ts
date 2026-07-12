import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { sendEmail, getContactFormTemplate } from '@/lib/emailService';

export async function GET() {
  try {
    const messagesRef = collection(db, 'messages');
    const querySnapshot = await getDocs(messagesRef);
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add message to Firestore
    const messagesRef = collection(db, 'messages');
    const docRef = await addDoc(messagesRef, {
      name,
      email,
      phone: phone || '',
      message,
      read: false,
      replied: false,
      createdAt: serverTimestamp(),
    });

    console.log('Message created:', docRef.id);

    // Send notification to admin
    const adminEmail = process.env.NODEMAILER_ADMIN_EMAIL;
    if (adminEmail) {
      const emailTemplate = getContactFormTemplate(name, email, phone || 'N/A', message);
      await sendEmail({
        to: adminEmail,
        subject: `New Contact Form Submission - ${name}`,
        html: emailTemplate,
      });
    }

    // Send confirmation to user
    await sendEmail({
      to: email,
      subject: 'We received your message - Paint Shop',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #2D5016; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">Madina Paint Store</h2>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9; color: #333;">
            <p>Hi ${name},</p>
            <p>Thank you for reaching out to Madina Paint Store. We have received your message and will get back to you as soon as possible.</p>
            <p style="margin-bottom: 0;">Best regards,</p>
            <p style="margin-top: 4px; font-weight: bold;">Madina Paint Store Team</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json(
      { success: true, messageId: docRef.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit message' },
      { status: 500 }
    );
  }
}
