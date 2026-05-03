import { NextResponse } from 'next/server';
import { connectDB, User, SquadHistory } from '@/../database.js';

export async function GET(request: Request, { params }: { params: Promise<{ squadName: string }> }) {
  try {
    await connectDB();
    const { squadName } = await params;
    const decodedName = decodeURIComponent(squadName);

    const SQUADS = ['Zenith Sentinels', 'Apex Titans', 'Meridian Arbiters', 'Horizon Vanguards'];
    if (!SQUADS.includes(decodedName)) {
      return NextResponse.json({ error: 'Invalid squad name' }, { status: 400 });
    }

    // Get members
    const members = await User.find({ squad: decodedName })
      .select('username avatar xp weeklyXp streak lastActive')
      .sort({ weeklyXp: -1 })
      .lean();

    const activeMembers = members.filter(m => m.weeklyXp >= 100);
    const totalXp = activeMembers.reduce((sum, m) => sum + m.weeklyXp, 0);
    const avgXp = activeMembers.length > 0 ? Math.round(totalXp / activeMembers.length) : 0;
    const mvp = activeMembers.length > 0 ? activeMembers[0] : null;
    const top3 = activeMembers.slice(0, 3);

    // Get Rivalry (Need to rank all squads to see who is above/below)
    const squadStats = await User.aggregate([
      { $match: { squad: { $ne: 'Unassigned', $exists: true } } },
      { 
        $group: {
          _id: '$squad',
          squadXp: { $sum: { $cond: [{ $gte: ['$weeklyXp', 100] }, '$weeklyXp', 0] } }
        }
      }
    ]);

    const statsMap = new Map(squadStats.map(s => [s._id, s.squadXp]));
    const rankedSquads = SQUADS.map(name => ({ name, xp: statsMap.get(name) || 0 }))
      .sort((a, b) => b.xp - a.xp);

    const myRank = rankedSquads.findIndex(s => s.name === decodedName);
    let rivalry = null;

    if (myRank > 0) {
      // Someone is ahead
      const ahead = rankedSquads[myRank - 1];
      rivalry = { type: 'behind', target: ahead.name, diff: ahead.xp - totalXp };
    } else if (myRank === 0 && rankedSquads.length > 1) {
      // We are first, someone is behind
      const behind = rankedSquads[1];
      rivalry = { type: 'ahead', target: behind.name, diff: totalXp - behind.xp };
    }

    // Get History
    const history = await SquadHistory.findOne({ squadName: decodedName });

    return NextResponse.json({
      success: true,
      data: {
        name: decodedName,
        totalXp,
        activeMemberCount: activeMembers.length,
        totalMemberCount: members.length,
        avgXp,
        mvp,
        top3,
        members: members.map((m, i) => ({ ...m, rank: i + 1 })),
        rivalry,
        history: {
          winStreak: history?.winStreak || 0,
          allTimeWins: history?.allTimeWins || 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching individual squad data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
