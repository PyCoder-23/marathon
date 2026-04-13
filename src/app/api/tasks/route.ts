import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const { connectDB, Task, User } = require('../../../../database.js');

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sessionToken')?.value;
  if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const user = await User.findOne({ sessionToken });
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tasks = await Task.find({ discordId: user.discordId }).sort({ createdAt: -1 });

    return NextResponse.json({
      tasks: tasks.map((t: any) => ({
        id: t._id.toString(),
        title: t.title,
        isCompleted: t.isCompleted || false
      }))
    });
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

    const { title } = await req.json();
    if (!title) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const newTask = await Task.create({ discordId: user.discordId, title });

    return NextResponse.json({ success: true, task: newTask });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sessionToken')?.value;
  if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const user = await User.findOne({ sessionToken });
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, isCompleted } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing task ID' }, { status: 400 });

    await Task.findOneAndUpdate({ _id: id, discordId: user.discordId }, { isCompleted });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    await Task.findOneAndDelete({ _id: id, discordId: user.discordId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
