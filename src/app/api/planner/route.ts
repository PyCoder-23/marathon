import { NextResponse } from 'next/server';
import { connectDB, CalendarEvent } from '@/../database.js';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const discordId = searchParams.get('discordId');

  if (!discordId) return NextResponse.json({ error: 'Missing discordId' }, { status: 400 });

  try {
    await connectDB();
    const events = await CalendarEvent.find({ discordId });
    return NextResponse.json({ events: events.map((e: any) => ({ ...e.toObject(), id: e._id.toString() })) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { id, discordId, title, description, date, startTime, endTime, color } = await req.json();
    if (!discordId || !title || !date || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
 
    await connectDB();
    if (id) {
      // Update existing
      const updated = await CalendarEvent.findByIdAndUpdate(id, 
        { title, description, date, startTime, endTime, color }, 
        { new: true }
      );
      if (!updated) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, event: { ...updated.toObject(), id: updated._id.toString() } });
    } else {
      // Create new
      const newEvent = await CalendarEvent.create({ discordId, title, description, date, startTime, endTime, color });
      return NextResponse.json({ success: true, event: { ...newEvent.toObject(), id: newEvent._id.toString() } });
    }
  } catch (error: any) {
    console.error("PLANNER_API_ERROR:", error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Missing task ID' }, { status: 400 });

  try {
    await connectDB();
    await CalendarEvent.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
