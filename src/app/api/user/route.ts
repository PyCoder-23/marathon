import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB, User, Session, Task } from '@/../database.js';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sessionToken')?.value;
  if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const user = await User.findOne({ sessionToken });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const discordId = user.discordId;

    const sessions = await Session.find({ discordId }).sort({ createdAt: -1 }).limit(5);
    const totalSessionsCount = await Session.countDocuments({ discordId });
    const completedTasksCount = await Task.countDocuments({ discordId, isCompleted: true });

    // Calculate Rank
    const allUsers = await User.find({}).sort({ weeklyXp: -1 });
    const rank = allUsers.findIndex(u => u.discordId === discordId) + 1;

    return NextResponse.json({
      user: {
        discordId: user.discordId,
        username: user.username,
        avatar: user.avatar,
        xp: user.xp,
        weeklyXp: user.weeklyXp,
        streak: user.streak,
        joinedAt: user.joinedAt,
        rank: rank
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
