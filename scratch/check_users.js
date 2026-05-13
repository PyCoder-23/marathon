const mongoose = require('mongoose');
require('dotenv').config({ path: './bot/.env' });

const userSchema = new mongoose.Schema({
  discordId: { type: String, required: true },
  username: { type: String, required: true },
  coins: { type: Number, default: 0 },
  sessionToken: { type: String },
});

const User = mongoose.model('User', userSchema);

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log(`Found ${users.length} users:`);
    
    const discordIds = {};
    users.forEach(u => {
      console.log(`- [${u._id}] Username: ${u.username}, DiscordID: ${u.discordId}, Coins: ${u.coins}, Token: ${u.sessionToken ? u.sessionToken.slice(-6) : 'null'}`);
      if (u.discordId) {
        if (!discordIds[u.discordId]) discordIds[u.discordId] = [];
        discordIds[u.discordId].push(u._id);
      }
    });

    Object.entries(discordIds).forEach(([id, ids]) => {
      if (ids.length > 1) {
        console.log(`⚠️ DUPLICATE DISCORD ID DETECTED: ${id} has ${ids.length} records!`);
      }
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUsers();
