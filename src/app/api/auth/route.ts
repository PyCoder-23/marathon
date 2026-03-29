import { NextResponse } from 'next/server';
import { connectDB, AuthCode, User } from '@/../database.js';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Invalid code provided' }, { status: 400 });
    }

    const authCode = await AuthCode.findOne({ code });

    if (!authCode) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
    }

    const user = await User.findOne({ discordId: authCode.discordId });

    if (!user) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    // Mark user as officially linked
    user.hasLinked = true;
    await user.save();

    // Code is valid and one-time use, remove it
    await AuthCode.deleteOne({ code });

    // Return the user data to be stored securely on the client
    return NextResponse.json({
      success: true,
      user: {
        discordId: user.discordId,
        username: user.username,
        avatar: user.avatar,
        xp: user.xp,
        weeklyXp: user.weeklyXp,
        streak: user.streak
      }
    });

  } catch (error) {
    console.error('API Error /auth:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
