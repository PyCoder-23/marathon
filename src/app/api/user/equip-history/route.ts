import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB, User } from '@/../database.js';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sessionToken')?.value;

  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findOne({ sessionToken });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { itemId } = await request.json();

    if (!user.equippedHistory.includes(itemId)) {
      user.equippedHistory.push(itemId);
      await user.save();
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Equip History Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
