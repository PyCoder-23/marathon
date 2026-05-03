import { NextResponse } from 'next/server';
import { connectDB, User } from '@/../database.js';

export async function GET() {
  try {
    await connectDB();

    const squadStats = await User.aggregate([
      { $match: { squad: { $ne: 'Unassigned', $exists: true } } },
      { 
        $group: {
          _id: '$squad',
          totalMembers: { $sum: 1 },
          activeMembers: {
            $sum: { $cond: [{ $gte: ['$weeklyXp', 100] }, 1, 0] }
          },
          squadXp: {
            $sum: { $cond: [{ $gte: ['$weeklyXp', 100] }, '$weeklyXp', 0] }
          }
        }
      },
      { $sort: { squadXp: -1 } }
    ]);

    // Ensure all 4 squads are represented even if 0 members
    const SQUADS = ['Zenith Sentinels', 'Apex Titans', 'Meridian Arbiters', 'Horizon Vanguards'];
    const statsMap = new Map(squadStats.map(s => [s._id, s]));

    const filledStats = SQUADS.map(name => {
      const stat = statsMap.get(name) || { squadXp: 0, activeMembers: 0, totalMembers: 0 };
      return {
        name,
        squadXp: stat.squadXp,
        activeMembers: stat.activeMembers,
        totalMembers: stat.totalMembers
      };
    });

    filledStats.sort((a, b) => b.squadXp - a.squadXp);

    const result = filledStats.map((squad, index) => ({
      ...squad,
      rank: index + 1
    }));

    return NextResponse.json({ success: true, squads: result });
  } catch (error) {
    console.error('Error fetching squads overview:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
