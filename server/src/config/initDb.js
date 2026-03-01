const pool = require('./database');

const initSQL = `
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────
-- Users
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name  VARCHAR(100) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────
-- Streaks
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS streaks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  current_streak  INTEGER DEFAULT 0,
  longest_streak  INTEGER DEFAULT 0,
  last_checkin    TIMESTAMPTZ DEFAULT NOW(),
  start_date      TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ─────────────────────────────────────
-- Relapses
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS relapses (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  timestamp        TIMESTAMPTZ DEFAULT NOW(),
  notes            TEXT,
  trigger_category VARCHAR(50),
  mood_before      INTEGER CHECK (mood_before >= 1 AND mood_before <= 5),
  mood_after       INTEGER CHECK (mood_after >= 1 AND mood_after <= 5),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────
-- Accountability Partners
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS partners (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
  partner_email       VARCHAR(255) NOT NULL,
  partner_name        VARCHAR(100),
  consent_status      VARCHAR(20) DEFAULT 'pending' CHECK (consent_status IN ('pending', 'accepted', 'declined')),
  notify_on_relapse   BOOLEAN DEFAULT false,
  notify_on_milestone BOOLEAN DEFAULT true,
  consent_token       VARCHAR(255),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────
-- Emergency Urge Logs
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS emergency_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  timestamp   TIMESTAMPTZ DEFAULT NOW(),
  outcome     VARCHAR(20) CHECK (outcome IN ('resisted', 'relapsed', 'ongoing')),
  duration_s  INTEGER,
  technique   VARCHAR(50),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_streaks_user     ON streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_relapses_user    ON relapses(user_id);
CREATE INDEX IF NOT EXISTS idx_relapses_time    ON relapses(timestamp);
CREATE INDEX IF NOT EXISTS idx_partners_user    ON partners(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_user   ON emergency_logs(user_id);
`;

async function initDatabase() {
    try {
        console.log('🔧 Initializing database schema...');
        await pool.query(initSQL);
        console.log('✅ Database schema initialized successfully');
    } catch (err) {
        console.error('❌ Database initialization failed:', err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    initDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { initDatabase, initSQL };
