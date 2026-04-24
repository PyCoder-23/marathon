const mongoose = require('mongoose');

// Need to safely check environment variables depending on context (Bot vs Next.js)
// For Next.js runtimes, typically process.env handles it automatically via .env.local
// For Bot, dotenv handles it. Let's make sure it's present.
const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable (Next.js .env.local or Bot .env)');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("Connected to MongoDB Atlas!");
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Schemas
const userSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  avatar: String,
  xp: { type: Number, default: 0 },
  weeklyXp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date },
  hasLinked: { type: Boolean, default: false },
  joinedAt: { type: Date, default: Date.now },
  sessionToken: { type: String },
});

userSchema.index({ weeklyXp: -1 });
userSchema.index({ xp: -1 });
userSchema.index({ sessionToken: 1 });

const authCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discordId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '30m' }, // Auto expires if not used
});

const taskSchema = new mongoose.Schema({
  discordId: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, default: 'General' },
  time: String,
  color: String,
  day: String,
  isCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }, // Used for auto-deletion
});

taskSchema.index({ discordId: 1 });


const journalSchema = new mongoose.Schema({
  discordId: { type: String, required: true },
  title: String,
  content: { type: String, required: true },
  mood: { type: String, default: 'Great' },
  date: String,
  createdAt: { type: Date, default: Date.now },
});

const sessionSchema = new mongoose.Schema({
  discordId: { type: String, required: true },
  duration: { type: Number, required: true },
  xpGranted: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

sessionSchema.index({ discordId: 1, createdAt: -1 });

const eventSchema = new mongoose.Schema({
  discordId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  date: { type: String, required: true }, // 'YYYY-MM-DD'
  startTime: { type: String, required: true }, // '09:00'
  endTime: { type: String, required: true }, // '10:00'
  color: { type: String, default: 'var(--accent)' }
});

const activeSessionSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  startTime: { type: Number, required: true },
  totalMs: { type: Number, default: 0 },
  paused: { type: Boolean, default: false },
  pauseTime: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now }
});

const globalConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now }
});

// Models (Singleton check for Next.js fast-refresh)
const User = mongoose.models.User || mongoose.model('User', userSchema);
const AuthCode = mongoose.models.AuthCode || mongoose.model('AuthCode', authCodeSchema);
const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
const JournalEntry = mongoose.models.JournalEntry || mongoose.model('JournalEntry', journalSchema);
const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);
const CalendarEvent = mongoose.models.CalendarEvent || mongoose.model('CalendarEvent', eventSchema);
const ActiveSession = mongoose.models.ActiveSession || mongoose.model('ActiveSession', activeSessionSchema);

const GlobalConfig = mongoose.models.GlobalConfig || mongoose.model('GlobalConfig', globalConfigSchema);

module.exports = { connectDB, User, AuthCode, Task, JournalEntry, Session, CalendarEvent, ActiveSession, GlobalConfig };
