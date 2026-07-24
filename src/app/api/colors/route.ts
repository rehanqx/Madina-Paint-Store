import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { logAdminAction } from '@/lib/activityLog';

function serializeDoc(doc: any) {
  const data = doc.data();
  const serialized: any = { id: doc.id };
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (val && typeof val === 'object' && val.toDate && typeof val.toDate === 'function') {
      serialized[key] = val.toDate().toISOString();
    } else {
      serialized[key] = val;
    }
  }
  return serialized;
}

export async function GET() {
  try {
    const snapshot = await adminDb.collection('color_cards').get();
    const items = snapshot.docs.map(doc => serializeDoc(doc));
    // Sort in-memory (newest first)
    items.sort((a: any, b: any) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
    return NextResponse.json(items);
  } catch (error: any) {
    console.error('API GET colors error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, hex, brand, adminEmail } = body;

    if (!name || !hex || !brand) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const docRef = await adminDb.collection('color_cards').add({
      name,
      hex,
      brand,
      createdAt: new Date(),
    });

    if (adminEmail) {
      await logAdminAction(
        adminEmail,
        'ADD_COLOR_CARD',
        `Added color card "${name}" (${hex}) under brand ${brand}`
      );
    }

    return NextResponse.json({ success: true, id: docRef.id }, { status: 201 });
  } catch (error: any) {
    console.error('API POST colors error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const colorName = searchParams.get('name') || id;
    const adminEmail = searchParams.get('adminEmail');

    if (!id) {
      return NextResponse.json({ error: 'Missing card ID' }, { status: 400 });
    }

    await adminDb.collection('color_cards').doc(id).delete();

    if (adminEmail) {
      await logAdminAction(
        adminEmail,
        'DELETE_COLOR_CARD',
        `Deleted color card "${colorName}"`
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API DELETE colors error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
