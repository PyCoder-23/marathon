import { NextResponse } from 'next/server';
const { connectDB, Task } = require('../../../../database.js');

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const discordId = searchParams.get('discordId');

  if (!discordId) return NextResponse.json({ error: 'No discord ID' }, { status: 400 });

  try {
    await connectDB();
    const tasks = await Task.find({ discordId }).sort({ createdAt: -1 });

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
  try {
    const { discordId, title } = await req.json();
    if (!discordId || !title) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    await connectDB();
    const newTask = await Task.create({ discordId, title });

    return NextResponse.json({ success: true, task: newTask });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, isCompleted } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing task ID' }, { status: 400 });

    await connectDB();
    await Task.findByIdAndUpdate(id, { isCompleted });

    return NextResponse.json({ success: true });
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
    await Task.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
