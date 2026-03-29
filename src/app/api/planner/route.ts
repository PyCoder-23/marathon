import { NextResponse } from 'next/server';
import { connectDB, EventModel } from '@/../database.js';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const discordId = searchParams.get('discordId');

  if (!discordId) return NextResponse.json({ error: 'Missing discordId' }, { status: 400 });

  try {
    await connectDB();
    const events = await EventModel.find({ discordId });
    return NextResponse.json({ events: events.map(e => ({ ...e.toObject(), id: e._id.toString() })) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { discordId, title, day, startTime, endTime, color } = await req.json();
    if (!discordId || !title || !day || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await connectDB();
    const newEvent = await EventModel.create({ discordId, title, day, startTime, endTime, color });
    return NextResponse.json({ success: true, event: { ...newEvent.toObject(), id: newEvent._id.toString() } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Missing task ID' }, { status: 400 });

  try {
    await connectDB();
    await EventModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
