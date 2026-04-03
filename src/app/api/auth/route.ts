import { NextResponse } from 'next/server';
import { connectDB, AuthCode, User } from '@/../database.js';
import fs from 'fs';
import path from 'path';

const DISCORD_API_BASE = 'https://discord.com/api/v10';
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const MEMBER_ROLE_NAME = process.env.MEMBER_ROLE_NAME || 'member';

async function discordFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${DISCORD_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bot ${DISCORD_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok && response.status !== 404) {
    const errorBody = await response.json().catch(() => ({}));
    console.error(`Discord API error (${endpoint}):`, response.status, errorBody);
    throw new Error(`Discord API error: ${response.status}`);
  }
  return response;
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Invalid code provided' }, { status: 400 });
    }

    const authCode = await AuthCode.findOne({ code });

    if (!authCode) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
    }

    const discordId = authCode.discordId;
    const user = await User.findOne({ discordId });

    if (!user) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    // --- Discord Algorithm ---
    
    // 1. Check if user is in server
    const memberRes = await discordFetch(`/guilds/${GUILD_ID}/members/${discordId}`);
    
    if (memberRes.status === 404) {
      // Try to DM the user that they were not found (might fail if no shared server)
      try {
        const dmChannelRes = await discordFetch('/users/@me/channels', {
          method: 'POST',
          body: JSON.stringify({ recipient_id: discordId })
        });
        const dmChannel = await dmChannelRes.json();
        
        if (dmChannel.id) {
          await discordFetch(`/channels/${dmChannel.id}/messages`, {
            method: 'POST',
            body: JSON.stringify({ 
              content: "🚫 **Registration Error:** You were not found in the Marathon Discord server. Please join the server to complete your registration." 
            })
          });
        }
      } catch (dmError) {
        console.error('Failed to send "not in server" DM:', dmError);
      }

      return NextResponse.json({ 
        error: 'Registration failed: You were not found in the Discord server. Please join the server first.' 
      }, { status: 403 });
    }

    const guildMember = await memberRes.json();

    // 2. Fetch all roles to find the "member" role ID
    const rolesRes = await discordFetch(`/guilds/${GUILD_ID}/roles`);
    const roles = await rolesRes.json();
    const targetRole = roles.find((r: any) => r.name.toLowerCase() === MEMBER_ROLE_NAME.toLowerCase());

    if (!targetRole) {
      console.error(`Role "${MEMBER_ROLE_NAME}" not found in server.`);
      // Proceed but log error? Or fail? User said "the role required to assign is called 'member'"
      // We should probably fail or proceed without role if it's missing, but let's log it.
    } else {
      const roleId = targetRole.id;
      const hasRole = guildMember.roles.includes(roleId);

      if (!hasRole) {
        // 3. User is new, give role and send DM
        await discordFetch(`/guilds/${GUILD_ID}/members/${discordId}/roles/${roleId}`, {
          method: 'PUT'
        });

        // Send welcome DM
        try {
          const welcomeFilePath = path.join(process.cwd(), 'welcome_message.txt');
          let welcomeMessage = 'Welcome to Marathon Server!';
          if (fs.existsSync(welcomeFilePath)) {
            welcomeMessage = fs.readFileSync(welcomeFilePath, 'utf8');
          }

          // Create DM channel
          const dmChannelRes = await discordFetch('/users/@me/channels', {
            method: 'POST',
            body: JSON.stringify({ recipient_id: discordId })
          });
          const dmChannel = await dmChannelRes.json();
          
          if (dmChannel.id) {
            await discordFetch(`/channels/${dmChannel.id}/messages`, {
              method: 'POST',
              body: JSON.stringify({ content: welcomeMessage })
            });
          }
        } catch (dmError) {
          console.error('Failed to send welcome DM:', dmError);
          // Don't fail registration if only DM fails
        }
      }
    }

    // --- End Discord Algorithm ---

    // Mark user as officially linked
    user.hasLinked = true;
    await user.save();

    // Code is valid and one-time use, remove it
    await AuthCode.deleteOne({ code });

    // Return the user data to be stored securely on the client
    return NextResponse.json({
      success: true,
      user: {
        discordId: user.discordId,
        username: user.username,
        avatar: user.avatar,
        xp: user.xp,
        weeklyXp: user.weeklyXp,
        streak: user.streak
      }
    });

  } catch (error) {
    console.error('API Error /auth:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
