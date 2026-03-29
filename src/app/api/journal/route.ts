import { NextResponse } from 'next/server';
import { connectDB, JournalEntry } from '@/../database.js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const discordId = searchParams.get('discordId');

  if (!discordId) {
    return NextResponse.json({ error: 'Missing discordId' }, { status: 400 });
  }

  try {
    await connectDB();
    const entries = await JournalEntry.find({ discordId }).sort({ createdAt: -1 });
    // Map _id back to id for frontend compatibility
    const mapped = entries.map(e => ({ ...e.toObject(), id: e._id.toString() }));
    return NextResponse.json({ entries: mapped });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { discordId, title, content, mood, date } = await request.json();

    if (!discordId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newEntry = await JournalEntry.create({
      discordId,
      title: title || '',
      content,
      mood: mood || 'Great',
      date: date || new Date().toISOString()
    });

    return NextResponse.json({ success: true, entryId: newEntry._id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const discordId = searchParams.get('discordId');

  if (!id || !discordId) {
    return NextResponse.json({ error: 'Missing id or discordId' }, { status: 400 });
  }

  try {
    await connectDB();
    await JournalEntry.findOneAndDelete({ _id: id, discordId });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

