import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB, CalendarEvent, User } from '@/../database.js';

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sessionToken')?.value;
  if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const user = await User.findOne({ sessionToken });
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const events = await CalendarEvent.find({ discordId: user.discordId });
    return NextResponse.json({ events: events.map((e: any) => ({ ...e.toObject(), id: e._id.toString() })) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sessionToken')?.value;
  if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const user = await User.findOne({ sessionToken });
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, title, description, date, startTime, endTime, color } = await req.json();
    if (!title || !date || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
 
    if (id) {
      // Update existing. Ensure we only update if it belongs to this user!
      const updated = await CalendarEvent.findOneAndUpdate(
        { _id: id, discordId: user.discordId },
        { title, description, date, startTime, endTime, color }, 
        { new: true }
      );
      if (!updated) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, event: { ...updated.toObject(), id: updated._id.toString() } });
    } else {
      // Create new
      const newEvent = await CalendarEvent.create({ discordId: user.discordId, title, description, date, startTime, endTime, color });
      return NextResponse.json({ success: true, event: { ...newEvent.toObject(), id: newEvent._id.toString() } });
    }
  } catch (error: any) {
    console.error("PLANNER_API_ERROR:", error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sessionToken')?.value;
  if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Missing task ID' }, { status: 400 });

  try {
    await connectDB();
    const user = await User.findOne({ sessionToken });
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Ensure they can only delete their own
    await CalendarEvent.findOneAndDelete({ _id: id, discordId: user.discordId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
