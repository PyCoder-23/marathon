import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB, User, Session, Task } from '@/../database.js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetDiscordId = searchParams.get('discordId');
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sessionToken')?.value;

  try {
    await connectDB();
    let user;

    if (targetDiscordId) {
      user = await User.findOne({ discordId: targetDiscordId });
    } else if (sessionToken) {
      user = await User.findOne({ sessionToken });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const discordId = user.discordId;

    const sessions = await Session.find({ discordId }).sort({ createdAt: -1 }).limit(5);
    const totalSessionsCount = await Session.countDocuments({ discordId });
    const completedTasksCount = await Task.countDocuments({ discordId, isCompleted: true });

    // Calculate Rank efficiently
    const rank = await User.countDocuments({ weeklyXp: { $gt: user.weeklyXp } }) + 1;
    
    // Calculate Squad Rank efficiently
    let squadRank = null;
    if (user.squad && user.squad !== 'Unassigned') {
      squadRank = await User.countDocuments({ squad: user.squad, weeklyXp: { $gt: user.weeklyXp } }) + 1;
    }

    return NextResponse.json({
      user: {
        discordId: user.discordId,
        username: user.username,
        avatar: user.avatar,
        xp: user.xp,
        weeklyXp: user.weeklyXp,
        streak: user.streak,
        coins: user.coins || 0,
        inventory: user.inventory || [],
        joinedAt: user.joinedAt,
        rank: rank,
        squad: user.squad || 'Unassigned',
        squadRank: squadRank,
        equippedItems: user.equippedItems || []
      },
      stats: {
        totalSessions: totalSessionsCount,
        completedTasks: completedTasksCount,
        recentSessions: sessions.map(s => ({
          ...s.toObject(),
          id: s._id.toString()
        }))
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
