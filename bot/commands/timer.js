const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { connectDB, Session, User, ActiveSession, GlobalConfig, SquadHistory } = require('../../database.js');

module.exports = {
  data: (() => {
    const builder = new SlashCommandBuilder()
      .setName('timer')
      .setDescription('Session tracking commands.')
      .addSubcommand(sub => sub.setName('start').setDescription('Initialize your study session.'))
      .addSubcommand(sub => sub.setName('pause').setDescription('Temporarily stop elapsed time.'))
      .addSubcommand(sub => sub.setName('resume').setDescription('Continue from last paused state.'))
      .addSubcommand(sub => sub.setName('view').setDescription('Check your current elapsed time.'))
      .addSubcommand(sub => sub.setName('quit').setDescription('Abandon the current timer without gaining XP.'))
      .addSubcommand(sub => {
        sub.setName('end').setDescription('Finalize your session and submit proof.');
        // Add 25 attachment options
        for (let i = 1; i <= 25; i++) {
          sub.addAttachmentOption(option => 
            option.setName(`proof${i}`)
              .setDescription(`Upload proof image #${i}${i === 1 ? ' (Required)' : ' (Optional)'}`)
              .setRequired(i === 1)
          );
        }
        return sub;
      });
    return builder;
  })(),

  async execute(interaction) {

    const sub = interaction.options.getSubcommand();
    const userId = interaction.user.id;
    
    await connectDB();
    const session = await ActiveSession.findOne({ discordId: userId });

    const embed = new EmbedBuilder().setColor('#00ff9f');

    if (sub === 'start') {
      if (session) return interaction.reply({ content: '🔋 A session is already active!', ephemeral: true });
      
      await ActiveSession.create({ 
        discordId: userId, 
        startTime: Date.now(), 
        totalMs: 0, 
        paused: false, 
        pauseTime: null 
      });

      return interaction.reply({ 
        embeds: [embed.setTitle('🚀 Session Initialized')
          .setDescription('Your marathon has started! Good luck with your focus.')
          .setTimestamp()] 
      });
    }

    if (!session) return interaction.reply({ content: '🚫 You are not currently in an active session. Run `/timer start`.', ephemeral: true });

    if (sub === 'pause') {
      if (session.paused) return interaction.reply({ content: '⏸️ Timer is already paused.', ephemeral: true });
      
      session.totalMs += (Date.now() - session.startTime);
      session.paused = true;
      session.pauseTime = Date.now();
      await session.save();

      return interaction.reply({ embeds: [embed.setTitle('⏸️ Session Paused').setDescription('Take a break. Timer stopped.')] });
    }

    if (sub === 'resume') {
      if (!session.paused) return interaction.reply({ content: '▶️ Timer is already running.', ephemeral: true });
      
      session.startTime = Date.now();
      session.paused = false;
      session.pauseTime = null;
      await session.save();

      return interaction.reply({ embeds: [embed.setTitle('▶️ Session Resumed').setDescription('Marathon continues...')] });
    }

    if (sub === 'view') {
      let currentMs = session.totalMs;
      if (!session.paused) currentMs += (Date.now() - session.startTime);
      const hours = Math.floor(currentMs / 3600000);
      const minutes = Math.floor((currentMs % 3600000) / 60000);
      const totalMinutes = hours * 60 + minutes;
      
      let potentialXp = 0;
      if (totalMinutes >= 25) {
        const user = await User.findOne({ discordId: userId });
        const config = await GlobalConfig.findOne({ key: 'xp_multiplier' });
        let globalMultiplier = config ? config.value : 1;
        
        const catalystConfig = await GlobalConfig.findOne({ key: 'global_10x_end_time' });
        if (catalystConfig && catalystConfig.value > Date.now()) {
          globalMultiplier *= 10;
        }

        const sessionMultiplier = session.multiplier || 1;
        
        let personalMultiplier = 1;
        if (user?.weekendRushMultiplier) personalMultiplier *= user.weekendRushMultiplier;
        if (user?.weeklyRushMultiplier) personalMultiplier *= user.weeklyRushMultiplier;
        if (user?.dailyRushDate) {
          const getSessionDate = (date) => {
            const d = new Date(date);
            d.setHours(d.getHours() - 4);
            d.setMinutes(d.getMinutes() - 30);
            d.setHours(0, 0, 0, 0);
            return d;
          };
          if (getSessionDate(new Date()).getTime() === getSessionDate(user.dailyRushDate).getTime()) {
            if (user.dailyRushMultiplier) personalMultiplier *= user.dailyRushMultiplier;
          }
        }
        
        let squadMultiplier = 1;
        if (user?.squad && user.squad !== 'Unassigned') {
          const squadInfo = await SquadHistory.findOne({ squadName: user.squad });
          if (squadInfo?.boostDate) {
            const getSessionDate = (date) => {
              const d = new Date(date);
              d.setHours(d.getHours() - 4);
              d.setMinutes(d.getMinutes() - 30);
              d.setHours(0, 0, 0, 0);
              return d;
            };
            if (getSessionDate(new Date()).getTime() === getSessionDate(squadInfo.boostDate).getTime()) {
              squadMultiplier = 1.2;
            }
          }
        }
        
        let baseMinutes = totalMinutes;
        let hourBoostedMinutes = 0;
        
        if (session.hourBoost) {
           hourBoostedMinutes = Math.min(60, totalMinutes);
           baseMinutes = totalMinutes - hourBoostedMinutes;
        }

        const hBM = session.hourBoostMultiplier || 1.5;
        const baseXP = baseMinutes * 0.8 * globalMultiplier * sessionMultiplier * personalMultiplier * squadMultiplier;
        const boostedXP = hourBoostedMinutes * 0.8 * globalMultiplier * sessionMultiplier * personalMultiplier * squadMultiplier * hBM;
        
        potentialXp = Math.round(baseXP + boostedXP);
      }

      return interaction.reply({ embeds: [embed.setTitle('👀 Current Status').setDescription(`Elapsed: **${hours}h ${minutes}m**\nPotential XP: **+${potentialXp} XP**`)] });
    }

    if (sub === 'quit') {
      await ActiveSession.deleteOne({ discordId: userId });
      return interaction.reply({ embeds: [embed.setTitle('🛑 Session Abandoned').setDescription('Your timer was canceled. No XP was awarded.')] });
    }

    if (sub === 'end') {
      // Gather all proof attachments
      const proofs = [];
      for (let i = 1; i <= 25; i++) {
        const attachment = interaction.options.getAttachment(`proof${i}`);
        if (attachment) {
          if (!attachment.contentType?.startsWith('image/')) {
            return interaction.reply({ content: `File #${i} is not an image. Please only upload images for verification.`, ephemeral: true });
          }
          proofs.push(attachment);
        }
      }

      if (proofs.length === 0) {
        return interaction.reply({ content: 'Please upload at least one image for verification.', ephemeral: true });
      }

      await interaction.deferReply(); // Defer to avoid timeout

      let finalMs = session.totalMs;
      if (!session.paused) finalMs += (Date.now() - session.startTime);
      const finalH = Math.floor(finalMs / 3600000);
      const finalM = Math.floor((finalMs % 3600000) / 60000);
      const totalMinutes = finalH * 60 + finalM;
      
      let xpEarned = 0;
      const user = await User.findOne({ discordId: userId });
      
      if (totalMinutes >= 25) {
        const config = await GlobalConfig.findOne({ key: 'xp_multiplier' });
        let globalMultiplier = config ? config.value : 1;
        
        const catalystConfig = await GlobalConfig.findOne({ key: 'global_10x_end_time' });
        if (catalystConfig && catalystConfig.value > Date.now()) {
          globalMultiplier *= 10;
        }

        const sessionMultiplier = session.multiplier || 1;
        
        let personalMultiplier = 1;
        if (user?.weekendRushMultiplier) personalMultiplier *= user.weekendRushMultiplier;
        if (user?.weeklyRushMultiplier) personalMultiplier *= user.weeklyRushMultiplier;
        if (user?.dailyRushDate) {
          const getSessionDate = (date) => {
            const d = new Date(date);
            d.setHours(d.getHours() - 4);
            d.setMinutes(d.getMinutes() - 30);
            d.setHours(0, 0, 0, 0);
            return d;
          };
          if (getSessionDate(new Date()).getTime() === getSessionDate(user.dailyRushDate).getTime()) {
            if (user.dailyRushMultiplier) personalMultiplier *= user.dailyRushMultiplier;
          }
        }
        
        let squadMultiplier = 1;
        if (user?.squad && user.squad !== 'Unassigned') {
          const squadInfo = await SquadHistory.findOne({ squadName: user.squad });
          if (squadInfo?.boostDate) {
            const getSessionDate = (date) => {
              const d = new Date(date);
              d.setHours(d.getHours() - 4);
              d.setMinutes(d.getMinutes() - 30);
              d.setHours(0, 0, 0, 0);
              return d;
            };
            if (getSessionDate(new Date()).getTime() === getSessionDate(squadInfo.boostDate).getTime()) {
              squadMultiplier = 1.2;
            }
          }
        }
        
        let baseMinutes = totalMinutes;
        let hourBoostedMinutes = 0;
        
        if (session.hourBoost) {
           hourBoostedMinutes = Math.min(60, totalMinutes);
           baseMinutes = totalMinutes - hourBoostedMinutes;
        }

        const hBM = session.hourBoostMultiplier || 1.5;
        const baseXP = baseMinutes * 0.8 * globalMultiplier * sessionMultiplier * personalMultiplier * squadMultiplier;
        const boostedXP = hourBoostedMinutes * 0.8 * globalMultiplier * sessionMultiplier * personalMultiplier * squadMultiplier * hBM;
        
        xpEarned = Math.round(baseXP + boostedXP);
      }

      const sessionEmbed = embed.setTitle('🏆 Session Concluded')
        .setDescription(`**${interaction.user.username}**, well done! Your work has been submitted.`)
        .addFields(
          { name: 'Total Duration', value: `\`${finalH}h ${finalM}m\``, inline: true },
          { name: 'XP Granted', value: `\`+${xpEarned} XP\``, inline: true },
          { name: 'Proof Count', value: `\`${proofs.length} Images\``, inline: true }
        )
        .setImage(proofs[0].url) // Show primary image in result
        .setTimestamp();

      await interaction.editReply({ embeds: [sessionEmbed] });

      // Clean up session
      await ActiveSession.deleteOne({ discordId: userId });

      // Save to database (NO IMAGE DATA SAVED)
      try {
        // Log Session
        await Session.create({
          discordId: userId,
          duration: finalMs,
          xpGranted: xpEarned
          // proofUrl removed as per strict privacy requirements
        });

        // Update User stats & Streak
        if (user) {
          const now = new Date();
          const lastActive = user.lastActive ? new Date(user.lastActive) : null;
          
          const getSessionDate = (date) => {
            const d = new Date(date);
            d.setHours(d.getHours() - 4);
            d.setMinutes(d.getMinutes() - 30);
            d.setHours(0, 0, 0, 0);
            return d;
          };

          if (xpEarned > 0) {
            if (lastActive) {
              const currentSession = getSessionDate(now);
              const lastSession = getSessionDate(lastActive);
              const diffDays = Math.round((currentSession.getTime() - lastSession.getTime()) / (1000 * 60 * 60 * 24));
              
              if (diffDays === 1) {
                user.streak += 1;
              } else if (diffDays > 1) {
                if (user.streakProtection) {
                  user.streakProtection = false; // Protection is consumed
                  if (diffDays > 2) {
                    user.streak = 1; // Missed more than 1 day, protection fails
                  }
                  // If diffDays === 2, streak stays frozen (no += 1, no = 1)
                } else {
                  user.streak = 1;
                }
              }
              
              if (user.streak === 0) {
                user.streak = 1; // Failsafe if streak was wiped by hard-reset
              }
            } else {
              user.streak = 1;
            }
            user.lastActive = now;
          } else {
            if (user.streak === 0) {
              user.streak = 1; // Basic failsafe if hard reset happened
            }
          }

          user.xp += xpEarned;
          user.weeklyXp += xpEarned;
          await user.save();
        }
      } catch (dbErr) {
        console.error('Failed to log session in DB:', dbErr);
      }

      // Log to proof channel (All proof images shown here)
      try {
        const proofChannel = interaction.guild.channels.cache.find(c => c.name === 'proof-of-work') || 
                             await interaction.guild.channels.fetch().then(cs => cs.find(c => c.name === 'proof-of-work'));
        
        if (proofChannel) {
          const logEmbeds = proofs.map((p, idx) => {
            const logEmbed = new EmbedBuilder()
              .setColor('#00ff9f')
              .setImage(p.url);
            
            if (idx === 0) {
              logEmbed.setTitle(`📝 Session Log: ${interaction.user.tag}`)
                .addFields(
                  { name: 'Duration', value: `${finalH}h ${finalM}m`, inline: true },
                  { name: 'ID', value: userId, inline: true },
                  { name: 'Proof Submitted', value: `${proofs.length} Images`, inline: true }
                )
                .setTimestamp();
            }
            return logEmbed;
          });

          // Discord allows 10 embeds per message. If more than 10, we'll send multiple messages.
          const chunks = [];
          for (let i = 0; i < logEmbeds.length; i += 10) {
            chunks.push(logEmbeds.slice(i, i + 10));
          }

          for (const chunk of chunks) {
            await proofChannel.send({ embeds: chunk });
          }
        }
      } catch (logErr) {
        console.error('Failed to log proof to channel:', logErr);
      }
    }
  },
};
