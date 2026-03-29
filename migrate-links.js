const { connectDB, User } = require('./database.js');

async function migrate() {
  await connectDB();
  await User.updateMany({}, { $set: { hasLinked: true } });
  console.log("Existing users auto-linked!");
  process.exit();
}

migrate();
