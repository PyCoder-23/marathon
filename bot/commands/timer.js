const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { connectDB, Session, User, ActiveSession, GlobalConfig, SquadHistory } = require('../../database.js');

function isWeekendRushActive() {
  const now = new Date();
  const day = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeString = hours + (minutes / 60);

  // Friday 7:30 PM (19.5) to Sunday 7:30 PM (19.5)
  if (day === 5 && timeString >= 19.5) return true;
  if (day === 6) return true;
  if (day === 0 && timeString < 19.5) return true;
  return false;
}

async function pauseSessionTimer(sessionDoc) {
  if (!sessionDoc.paused) {
    sessionDoc.totalMs += (Date.now() - sessionDoc.startTime);
    sessionDoc.paused = true;
    sessionDoc.pauseTime = Date.now();
    await sessionDoc.save();
  }
}

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
        // Add optional link option
        sub.addStringOption(option =>
          option.setName('link')
            .setDescription('URL proof of work (e.g. GitHub, Google Docs) (Optional)')
            .setRequired(false)
        );
        // Add 25 attachment options (all optional)
        for (let i = 1; i <= 25; i++) {
          sub.addAttachmentOption(option => 
            option.setName(`proof${i}`)
              .setDescription(`Upload proof file #${i} (Optional)`)
              .setRequired(false)
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
      
      let potentialIndivXp = 0;
      let potentialSquadXp = 0;
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
              squadMultiplier = squadInfo.squadMultiplier || 1.2;
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
        const adminWeekendMultiplier = isWeekendRushActive() ? 2 : 1;

        // Individual XP
        potentialIndivXp = Math.round(totalMinutes * 0.8 * globalMultiplier * adminWeekendMultiplier);

        // Squad XP
        const baseSquadXP = baseMinutes * 0.8 * globalMultiplier * sessionMultiplier * personalMultiplier * squadMultiplier * adminWeekendMultiplier;
        const boostedSquadXP = hourBoostedMinutes * 0.8 * globalMultiplier * sessionMultiplier * personalMultiplier * squadMultiplier * hBM * adminWeekendMultiplier;
        potentialSquadXp = Math.round(baseSquadXP + boostedSquadXP);
      }

      const timerStatus = session.paused ? '⏸️ **Paused**' : '▶️ **Running**';

      return interaction.reply({ embeds: [embed.setTitle('👀 Current Status').setDescription(`Status: ${timerStatus}\nElapsed: **${hours}h ${minutes}m**\nPotential Individual XP: **+${potentialIndivXp} XP**\nPotential Squad XP: **+${potentialSquadXp} XP**`)] });
    }

    if (sub === 'quit') {
      await ActiveSession.deleteOne({ discordId: userId });
      return interaction.reply({ embeds: [embed.setTitle('🛑 Session Abandoned').setDescription('Your timer was canceled. No XP was awarded.')] });
    }

    if (sub === 'end') {
      const linkProof = interaction.options.getString('link');
      const proofs = [];
      const allowedTypes = ['image/', 'video/', 'text/', 'application/pdf'];

      for (let i = 1; i <= 25; i++) {
        const attachment = interaction.options.getAttachment(`proof${i}`);
        if (attachment) {
          const isAllowed = allowedTypes.some(type => attachment.contentType?.startsWith(type));
          if (!isAllowed) {
            return interaction.reply({ 
              content: `❌ **ERROR:** File #${i} (\`${attachment.name}\`) is not an allowed proof format. Please only upload Images, Videos, PDFs, or Text files.`, 
              ephemeral: true 
            });
          }
          proofs.push(attachment);
        }
      }

      // Check if at least one proof of any kind was provided
      if (proofs.length === 0 && !linkProof) {
        return interaction.reply({ 
          content: '❌ **ERROR:** Please submit at least one proof of work (either an uploaded file or a link-based proof).', 
          ephemeral: true 
        });
      }

      // Validate URL format for linkProof if provided
      if (linkProof) {
        try {
          new URL(linkProof);
        } catch (_) {
          return interaction.reply({ 
            content: '❌ **ERROR:** The provided link-based proof is not a valid URL. Please provide a valid URL starting with http:// or https://', 
            ephemeral: true 
          });
        }
      }

      // Pre-emptive Size Limit Check (Discord limit is 25MB total for standard uploads)
      const MAX_DISCORD_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
      let totalSize = 0;
      for (const p of proofs) {
        if (p.size > MAX_DISCORD_FILE_SIZE) {
          await pauseSessionTimer(session);
          return interaction.reply({
            content: `⚠️ **PROOF TOO LARGE:** The attachment \`${p.name}\` exceeds the 25MB limit (${(p.size / 1024 / 1024).toFixed(2)}MB). Your timer has been **paused** to preserve your progress. Please reduce the file size and try again.`,
            ephemeral: false
          });
        }
        totalSize += p.size;
      }

      if (totalSize > MAX_DISCORD_FILE_SIZE) {
        await pauseSessionTimer(session);
        return interaction.reply({
          content: `⚠️ **TOTAL PROOF SIZE TOO LARGE:** The total size of your uploads is ${(totalSize / 1024 / 1024).toFixed(2)}MB, which exceeds the 25MB limit. Your timer has been **paused** to preserve your progress. Please upload smaller files and try again.`,
          ephemeral: false
        });
      }

      await interaction.deferReply(); // Defer to avoid timeout

      let finalMs = session.totalMs;
      if (!session.paused) finalMs += (Date.now() - session.startTime);
      const finalH = Math.floor(finalMs / 3600000);
      const finalM = Math.floor((finalMs % 3600000) / 60000);
      const totalMinutes = finalH * 60 + finalM;
      
      let individualXpEarned = 0;
      let squadXpEarned = 0;
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
              squadMultiplier = squadInfo.squadMultiplier || 1.2;
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
        const adminWeekendMultiplier = isWeekendRushActive() ? 2 : 1;

        // Individual XP
        individualXpEarned = Math.round(totalMinutes * 0.8 * globalMultiplier * adminWeekendMultiplier);

        // Squad XP
        const baseSquadXP = baseMinutes * 0.8 * globalMultiplier * sessionMultiplier * personalMultiplier * squadMultiplier * adminWeekendMultiplier;
        const boostedSquadXP = hourBoostedMinutes * 0.8 * globalMultiplier * sessionMultiplier * personalMultiplier * squadMultiplier * hBM * adminWeekendMultiplier;
        squadXpEarned = Math.round(baseSquadXP + boostedSquadXP);
      }

      // --- DISCORD UPLOAD / LOG GATE ---
      try {
        const fileAttachments = proofs.map(p => ({ attachment: p.url, name: p.name }));
        const proofChannel = interaction.guild.channels.cache.find(c => c.name === 'proof-of-work') || 
                             await interaction.guild.channels.fetch().then(cs => cs.find(c => c.name === 'proof-of-work'));
        
        if (proofChannel) {
          const logEmbed = new EmbedBuilder()
            .setTitle(`📝 Session Log: ${interaction.user.tag}`)
            .setColor('#00ff9f')
            .addFields(
              { name: 'Duration', value: `${finalH}h ${finalM}m`, inline: true },
              { name: 'Individual XP', value: `\`+${individualXpEarned} XP\``, inline: true },
              { name: 'Squad XP', value: `\`+${squadXpEarned} XP\``, inline: true },
              { name: 'Proof Submitted', value: `${proofs.length} Files`, inline: false }
            )
            .setTimestamp();

          if (linkProof) {
            logEmbed.addFields({ name: '🔗 Link Proof', value: `[Click here to view proof](${linkProof})` });
          }

          // Send summary and attachments to the proof log channel
          await proofChannel.send({ embeds: [logEmbed], files: fileAttachments });
        }

        // Finalize User and Session State
        const sessionEmbed = embed.setTitle('🏆 Session Concluded')
          .setDescription(`**${interaction.user.username}**, well done! Your work has been submitted.`)
          .addFields(
            { name: 'Total Duration', value: `\`${finalH}h ${finalM}m\``, inline: true },
            { name: 'Individual XP Granted', value: `\`+${individualXpEarned} XP\``, inline: true },
            { name: 'Squad XP Granted', value: `\`+${squadXpEarned} XP\``, inline: true },
            { name: 'Proof Count', value: `\`${proofs.length} Files\``, inline: true }
          )
          .setTimestamp();

        if (linkProof) {
          sessionEmbed.addFields({ name: '🔗 Link Proof', value: `[Click here to view proof](${linkProof})` });
        }

        // Display the primary image if the first attachment is an image
        if (proofs.length > 0 && proofs[0].contentType?.startsWith('image/')) {
          sessionEmbed.setImage(proofs[0].url);
        }

        await interaction.editReply({ embeds: [sessionEmbed], files: fileAttachments });

      } catch (uploadErr) {
        console.error('Discord file upload failed during /timer end:', uploadErr);
        await pauseSessionTimer(session);
        return interaction.editReply({
          content: `⚠️ **UPLOAD FAILED:** The bot could not upload or process your proof files due to Discord limits or connection issues. Your timer has been **paused** to preserve your progress. Please reduce the size/duration of your content and try ending your session again.`,
          embeds: [],
          files: []
        });
      }

      // --- CLEAN UP ACTIVE SESSION ---
      await ActiveSession.deleteOne({ discordId: userId });

      // Save concluded session in database (NO IMAGE DATA SAVED)
      try {
        await Session.create({
          discordId: userId,
          duration: finalMs,
          xpGranted: individualXpEarned,
          squadXpGranted: squadXpEarned
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

          if (individualXpEarned > 0) {
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
                } else {
                  user.streak = 1;
                }
              }
            } else {
              user.streak = 1;
            }
            user.lastActive = now;
          }

          user.xp += individualXpEarned;
          user.weeklyXp += individualXpEarned;
          user.weeklySquadXp = (user.weeklySquadXp || 0) + squadXpEarned;
          await user.save();
        }
      } catch (dbErr) {
        console.error('Failed to log session in DB:', dbErr);
      }
    }
  },
};
