import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import Database from 'better-sqlite3';
import { BigNumber } from 'bignumber.js';
import Decimal from 'decimal.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const app = new Hono();
const db = new Database('stakepool.db');

// Enable CORS
app.use('/*', cors());

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS pools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    token TEXT NOT NULL,
    apy REAL NOT NULL,
    tvl TEXT DEFAULT '0',
    min_stake TEXT DEFAULT '0',
    lock_period INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS stakes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pool_id INTEGER NOT NULL,
    user_address TEXT NOT NULL,
    amount TEXT NOT NULL,
    rewards TEXT DEFAULT '0',
    staked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    unlock_at DATETIME,
    FOREIGN KEY (pool_id) REFERENCES pools(id)
  );

  CREATE TABLE IF NOT EXISTS rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stake_id INTEGER NOT NULL,
    amount TEXT NOT NULL,
    claimed BOOLEAN DEFAULT 0,
    claimed_at DATETIME,
    FOREIGN KEY (stake_id) REFERENCES stakes(id)
  );
`);

// Seed initial pools
const poolCount = db.prepare('SELECT COUNT(*) as count FROM pools').get();
if (poolCount.count === 0) {
  const insert = db.prepare(`
    INSERT INTO pools (name, token, apy, tvl, min_stake, lock_period)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insert.run('ETH Flexible', 'ETH', 5.2, '1000000', '0.1', 0);
  insert.run('ETH 30-Day', 'ETH', 8.5, '2500000', '0.5', 30);
  insert.run('ETH 90-Day', 'ETH', 12.8, '5000000', '1.0', 90);
  insert.run('USDC Stable', 'USDC', 6.5, '3000000', '100', 0);
  insert.run('LP Token Pool', 'UNI-LP', 25.0, '500000', '10', 60);
}

// Calculate rewards using BigNumber for precision
function calculateRewards(amount, apy, daysStaked) {
  const principal = new BigNumber(amount);
  const rate = new BigNumber(apy).dividedBy(100).dividedBy(365);
  const rewards = principal.multipliedBy(rate).multipliedBy(daysStaked);
  return rewards.toFixed(18);
}

// Routes
app.get('/', (c) => {
  return c.json({ 
    message: '💎 StakePool Protocol API',
    version: '1.0.0',
    endpoints: ['/pools', '/stakes', '/rewards']
  });
});

app.get('/pools', (c) => {
  const pools = db.prepare('SELECT * FROM pools ORDER BY apy DESC').all();
  return c.json({ pools });
});

app.get('/pools/:id', (c) => {
  const { id } = c.req.param();
  const pool = db.prepare('SELECT * FROM pools WHERE id = ?').get(id);
  
  if (!pool) {
    return c.json({ error: 'Pool not found' }, 404);
  }
  
  const stakes = db.prepare('SELECT * FROM stakes WHERE pool_id = ?').all(id);
  return c.json({ pool, stakes });
});

app.post('/stake', async (c) => {
  const { poolId, userAddress, amount } = await c.req.json();
  
  const pool = db.prepare('SELECT * FROM pools WHERE id = ?').get(poolId);
  if (!pool) {
    return c.json({ error: 'Pool not found' }, 404);
  }
  
  const amountBN = new BigNumber(amount);
  const minStake = new BigNumber(pool.min_stake);
  
  if (amountBN.isLessThan(minStake)) {
    return c.json({ error: 'Amount below minimum stake' }, 400);
  }
  
  const unlockDate = new Date();
  unlockDate.setDate(unlockDate.getDate() + pool.lock_period);
  
  const insert = db.prepare(`
    INSERT INTO stakes (pool_id, user_address, amount, unlock_at)
    VALUES (?, ?, ?, ?)
  `);
  
  const result = insert.run(poolId, userAddress, amount, unlockDate.toISOString());
  
  // Update pool TVL
  const newTVL = new BigNumber(pool.tvl).plus(amount).toFixed();
  db.prepare('UPDATE pools SET tvl = ? WHERE id = ?').run(newTVL, poolId);
  
  return c.json({ 
    success: true, 
    stakeId: result.lastInsertRowid,
    unlockAt: unlockDate 
  });
});

app.get('/rewards/:stakeId', (c) => {
  const { stakeId } = c.req.param();
  
  const stake = db.prepare(`
    SELECT s.*, p.apy 
    FROM stakes s 
    JOIN pools p ON s.pool_id = p.id 
    WHERE s.id = ?
  `).get(stakeId);
  
  if (!stake) {
    return c.json({ error: 'Stake not found' }, 404);
  }
  
  const stakedDate = new Date(stake.staked_at);
  const now = new Date();
  const daysStaked = Math.floor((now - stakedDate) / (1000 * 60 * 60 * 24));
  
  const rewards = calculateRewards(stake.amount, stake.apy, daysStaked);
  
  return c.json({
    stakeId: stake.id,
    amount: stake.amount,
    rewards,
    daysStaked,
    apy: stake.apy
  });
});

app.post('/claim', async (c) => {
  const { stakeId } = await c.req.json();
  
  const stake = db.prepare('SELECT * FROM stakes WHERE id = ?').get(stakeId);
  if (!stake) {
    return c.json({ error: 'Stake not found' }, 404);
  }
  
  const unlockDate = new Date(stake.unlock_at);
  if (new Date() < unlockDate) {
    return c.json({ error: 'Stake is still locked' }, 400);
  }
  
  // Record reward claim
  const insert = db.prepare(`
    INSERT INTO rewards (stake_id, amount, claimed, claimed_at)
    VALUES (?, ?, 1, ?)
  `);
  
  insert.run(stakeId, stake.rewards, new Date().toISOString());
  
  return c.json({ success: true, rewards: stake.rewards });
});

const port = process.env.PORT || 3000;
console.log(`💎 StakePool Protocol running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});

