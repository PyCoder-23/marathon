import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB, User } from '@/../database.js';
import { SHOP_ITEMS } from '@/lib/shopData';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sessionToken')?.value;

  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findOne({ sessionToken });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { itemId } = await request.json();
    const item = SHOP_ITEMS.find(i => i.id === itemId);

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // 1. Verify user owns the item
    if (!user.inventory.includes(itemId)) {
      return NextResponse.json({ error: 'You do not own this item' }, { status: 400 });
    }

    // 2. Verify item is not a boost (used boosts are removed, but user said "used boosts ... not possible to return")
    // If it's in inventory, it's not used yet, but usually boosts aren't returnable once bought in many systems.
    // The user specifically mentioned boosts.
    if (item.section === 'Boosts') {
        return NextResponse.json({ error: 'Performance boosts are non-refundable' }, { status: 400 });
    }

    // 3. Verify item has NEVER been equipped
    if (user.equippedHistory && user.equippedHistory.includes(itemId)) {
      return NextResponse.json({ 
        error: 'Items that have been equipped at least once are ineligible for return.' 
      }, { status: 400 });
    }

    // 4. Double check if currently equipped (should be covered by equippedHistory but better safe)
    // Actually, equippedItems aren't stored in DB directly yet (they are in localStorage).
    // Wait, I should probably check if I should update the DB to store equipped items too.
    // For now, equippedHistory is our source of truth for "used" items.

    // 5. Process Return
    // Remove one instance from inventory
    const index = user.inventory.indexOf(itemId);
    if (index > -1) {
      user.inventory.splice(index, 1);
    }
    
    // Refund coins
    user.coins = (user.coins || 0) + item.price;

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Item returned successfully',
      coins: user.coins,
      inventory: user.inventory
    });

  } catch (error) {
    console.error('Return Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
