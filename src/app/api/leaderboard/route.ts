import { NextResponse } from 'next/server';
import { connectDB, User } from '../../../../database.js';

export async function GET() {
  try {
    await connectDB();

    // Fetch top 25 users sorted by weeklyXp descending
    const users = await User.find({})
      .sort({ weeklyXp: -1 })
      .limit(25)
      .select('discordId username avatar xp weeklyXp streak');

    const leaderboard = users.map((u, index) => ({
      rank: index + 1,
      discordId: u.discordId,
      username: u.username,
      avatar: u.avatar,
      weeklyXp: u.weeklyXp || 0,
      totalXp: u.xp || 0,
      streak: u.streak || 0,
    }));

    return NextResponse.json({ leaderboard });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
