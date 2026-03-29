const { connectDB, AuthCode, User } = require('./database.js');

async function test() {
  await connectDB();
  const codes = await AuthCode.find();
  console.log("ALL AUTH CODES DB:");
  console.log(codes);
  const users = await User.find();
  console.log("ALL USERS DB:");
  console.log(users);
  process.exit(0);
}

test();
