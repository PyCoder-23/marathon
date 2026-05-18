import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB, User } from '@/../database.js';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sessionToken')?.value;

  if (!sessionToken) {
    // We will allow missing sessionToken if discordId is provided in body
  }

  try {
    const { equippedItems, discordId } = await request.json();
    
    await connectDB();
    let user;
    if (discordId) {
      user = await User.findOne({ discordId });
    } else if (sessionToken) {
      user = await User.findOne({ sessionToken });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (Array.isArray(equippedItems)) {
      user.equippedItems = equippedItems;
      await user.save();
    }

    return NextResponse.json({ success: true, equippedItems: user.equippedItems });

  } catch (error) {
    console.error('Equip Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
