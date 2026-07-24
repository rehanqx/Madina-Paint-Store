import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, rating, text } = body;

    if (!name || rating === undefined || !text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const docRef = await adminDb.collection('reviews').add({
      name,
      rating: Number(rating),
      text,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: docRef.id }, { status: 201 });
  } catch (error: any) {
    console.error('API POST reviews error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
