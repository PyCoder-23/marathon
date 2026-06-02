import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB, User } from '@/../database.js';
import { SHOP_ITEMS } from '@/lib/shopData';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sessionToken')?.value;
  if (!sessionToken) {
    // We will allow missing sessionToken if discordId is provided in body
  }

  try {
    const { itemId, discordId } = await request.json();
    if (!itemId) return NextResponse.json({ error: 'Item ID required' }, { status: 400 });

    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    await connectDB();
    let user;
    if (discordId) {
      user = await User.findOne({ discordId });
    } else if (sessionToken) {
      user = await User.findOne({ sessionToken });
    }
    
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Check if user already owns the decoration (boosts can be bought multiple times)
    if (item.section !== 'Boosts' && user.inventory.includes(itemId)) {
      return NextResponse.json({ error: 'Item already owned' }, { status: 400 });
    }

    const teamOnlyItemIds = ['bst-mini-sabotage', 'bst-purple-fever', 'bst-anti-viral', 'bst-vampire', 'bst-xp-generator'];
    if (teamOnlyItemIds.includes(itemId)) {
      if (!user.squad || user.squad === 'Unassigned') {
        return NextResponse.json({ error: 'This boost is team-only. You must join a squad first!' }, { status: 400 });
      }
    }

    // Check coins
    if ((user.coins || 0) < item.price) {
      return NextResponse.json({ error: 'Insufficient coins' }, { status: 400 });
    }

    // Process transaction
    user.coins -= item.price;
    user.inventory.push(itemId);
    await user.save();

    return NextResponse.json({ 
      success: true, 
      coins: user.coins,
      inventory: user.inventory 
    });

  } catch (error) {
    console.error('[SHOP_PURCHASE_ERROR]', error);
    return NextResponse.json({ error: 'Transaction failed' }, { status: 500 });
  }
}
