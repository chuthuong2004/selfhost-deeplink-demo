# 🗄️ Database Configuration for Vercel Deployment

## ⚠️ Important: Vercel Serverless Limitations

Vercel Serverless Functions run in a **read-only filesystem** environment. This means:
- ❌ Cannot write to local JSON files
- ❌ Cannot create directories or files
- ❌ Data will NOT persist between requests
- ✅ Can only read pre-deployed files

## 🔧 Current Implementation (Development Only)

The current implementation uses a **JSON file database** (`data/referrals.json`) which:
- ✅ Works perfectly for local development
- ❌ **Does NOT work on Vercel** (read-only filesystem)
- ⚠️ App will start but data won't be saved

## 🚀 Production-Ready Solutions

For production deployment on Vercel, you need an **external database**. Here are recommended options:

### Option 1: Vercel KV (Redis) - Recommended ⭐
**Best for**: Simple key-value storage, fast reads/writes

```bash
# Install Vercel KV
npm install @vercel/kv

# Add to your Vercel project
vercel env add KV_REST_API_URL
vercel env add KV_REST_API_TOKEN
```

**Implementation Example:**
```javascript
import { kv } from '@vercel/kv';

// Save referral
await kv.set(`referral:${id}`, referralData);

// Get referral
const referral = await kv.get(`referral:${id}`);

// Get all referrals
const keys = await kv.keys('referral:*');
const referrals = await Promise.all(keys.map(key => kv.get(key)));
```

### Option 2: MongoDB Atlas - Popular Choice 🌟
**Best for**: Complex queries, relational data

```bash
npm install mongodb
```

**Setup:**
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster and get connection string
3. Add to Vercel environment variables

```javascript
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db('deeplinks');
const referrals = db.collection('referrals');

// Save referral
await referrals.insertOne(referralData);

// Find referral
const referral = await referrals.findOne({ id });
```

### Option 3: PostgreSQL (Vercel Postgres) 🐘
**Best for**: Complex relational data, SQL queries

```bash
npm install @vercel/postgres
```

```javascript
import { sql } from '@vercel/postgres';

// Create table
await sql`
  CREATE TABLE IF NOT EXISTS referrals (
    id TEXT PRIMARY KEY,
    ref TEXT,
    data JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
  )
`;

// Insert
await sql`INSERT INTO referrals (id, ref, data) VALUES (${id}, ${ref}, ${data})`;

// Query
const result = await sql`SELECT * FROM referrals WHERE id = ${id}`;
```

### Option 4: Supabase (PostgreSQL) 🚀
**Best for**: PostgreSQL + Auth + Realtime features

```bash
npm install @supabase/supabase-js
```

## 📝 Migration Steps

### Step 1: Choose Your Database
Pick one of the options above based on your needs

### Step 2: Update `database.service.js`
Replace the file operations with your chosen database client

### Step 3: Add Environment Variables
Add database credentials to Vercel:
```bash
vercel env add DATABASE_URL
# or
vercel env add MONGODB_URI
# or
vercel env add KV_REST_API_URL
```

### Step 4: Test Locally
```bash
# Set environment variables
export DATABASE_URL="your-database-url"

# Test
npm start
```

### Step 5: Deploy to Vercel
```bash
vercel --prod
```

## 🔍 Current Status

The app has been **fixed to run on Vercel** without crashing, but:
- ✅ App starts successfully
- ✅ All routes work
- ⚠️ **Data is NOT persisted** (read-only filesystem)
- 💡 You need to implement one of the database solutions above

## 🛠️ Quick Test

After deploying, test these endpoints:
```bash
# Health check (should work)
curl https://your-app.vercel.app/health

# Create referral (will log warning, won't save)
curl https://your-app.vercel.app/share?productId=TEST123

# Debug referrals (will return empty array)
curl https://your-app.vercel.app/debug/referrals
```

## 📚 Recommended: Vercel KV for Quick Start

For the fastest setup, use **Vercel KV**:
1. Go to your Vercel project dashboard
2. Click "Storage" → "Create Database" → "KV"
3. Install: `npm install @vercel/kv`
4. Update `database.service.js` with KV implementation
5. Deploy!

## 💡 Need Help?

- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Supabase](https://supabase.com/docs)

