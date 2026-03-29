import { NextResponse } from 'next/server';
import { connectDB, User, Session, Task } from '@/../database.js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const discordId = searchParams.get('discordId');

  if (!discordId) {
    return NextResponse.json({ error: 'Missing discordId' }, { status: 400 });
  }

  try {
    await connectDB();
    const user = await User.findOne({ discordId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const sessions = await Session.find({ discordId }).sort({ createdAt: -1 }).limit(5);
    const totalSessionsCount = await Session.countDocuments({ discordId });
    const completedTasksCount = await Task.countDocuments({ discordId, isCompleted: true });

    return NextResponse.json({
      user: {
        discordId: user.discordId,
        username: user.username,
        avatar: user.avatar,
        xp: user.xp,
        weeklyXp: user.weeklyXp,
        streak: user.streak,
        joinedAt: user.joinedAt
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
