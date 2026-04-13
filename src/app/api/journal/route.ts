import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB, JournalEntry, User } from '@/../database.js';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sessionToken')?.value;
  if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const user = await User.findOne({ sessionToken });
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const discordId = user.discordId;

    const entries = await JournalEntry.find({ discordId }).sort({ createdAt: -1 });
    // Map _id back to id for frontend compatibility
    const mapped = entries.map(e => ({ ...e.toObject(), id: e._id.toString() }));
    return NextResponse.json({ entries: mapped });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sessionToken')?.value;
  if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const user = await User.findOne({ sessionToken });
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const discordId = user.discordId;

    const { title, content, mood, date } = await request.json();

    if (!content) {
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
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sessionToken')?.value;
  if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    await connectDB();
    const user = await User.findOne({ sessionToken });
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const discordId = user.discordId;

    await JournalEntry.findOneAndDelete({ _id: id, discordId });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

