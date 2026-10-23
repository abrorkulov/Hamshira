CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(120) NOT NULL,
  phone VARCHAR(32) NOT NULL UNIQUE, email VARCHAR(254) UNIQUE,
  password_hash TEXT NOT NULL, birth_date DATE, avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(140) NOT NULL,
  description TEXT NOT NULL DEFAULT '', price INTEGER NOT NULL CHECK(price >= 0),
  category VARCHAR(32) NOT NULL CHECK(category IN ('muolaja','diagnostika','parvarish','boshqa')),
  icon VARCHAR(80) NOT NULL DEFAULT 'medkit-outline', icon_bg VARCHAR(16) NOT NULL DEFAULT '#EBF5FF',
  icon_color VARCHAR(16) NOT NULL DEFAULT '#3B82F6', popular BOOLEAN NOT NULL DEFAULT FALSE,
  duration VARCHAR(60), active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(140) NOT NULL,
  specialty VARCHAR(100) NOT NULL, rating NUMERIC(2,1) NOT NULL DEFAULT 5 CHECK(rating BETWEEN 0 AND 5),
  experience INTEGER NOT NULL DEFAULT 0 CHECK(experience >= 0), image TEXT NOT NULL DEFAULT '',
  available BOOLEAN NOT NULL DEFAULT TRUE, price INTEGER NOT NULL DEFAULT 0 CHECK(price >= 0),
  review_count INTEGER NOT NULL DEFAULT 0 CHECK(review_count >= 0), active BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(60) NOT NULL, "full" TEXT NOT NULL, district VARCHAR(100) NOT NULL DEFAULT '',
  city VARCHAR(100) NOT NULL DEFAULT '', is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS addresses_one_default_per_user ON addresses(user_id) WHERE is_default;
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id), doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  appointment_at TIMESTAMPTZ NOT NULL, address TEXT NOT NULL DEFAULT '',
  status VARCHAR(24) NOT NULL DEFAULT 'kutilmoqda' CHECK(status IN ('kutilmoqda','tasdiqlangan','bajarilmoqda','bajarildi','bekor_qilindi')),
  "type" VARCHAR(24) NOT NULL DEFAULT 'uyga_tashrif' CHECK("type" IN ('uyga_tashrif','onlayn_maslahat')),
  price INTEGER NOT NULL CHECK(price >= 0), notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS orders_user_created_idx ON orders(user_id, created_at DESC);
