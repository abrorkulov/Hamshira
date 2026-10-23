require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { z, ZodError } = require('zod');


const app = express();
const port = Number(process.env.PORT || 4000);

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hamshira API',
      version: '1.0.0',
      description:
        'Hamshira mobile app uchun Express REST API. Barcha public va protected endpointlar ro\'yxati.',
    },
    servers: [{ url: `http://localhost:${port}` }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [],
});

swaggerSpec.paths = {
  '/api/health': {
    get: {
      summary: 'API holati va DB statusi',
      responses: { 200: { description: 'OK' }, 503: { description: 'DB mavjud emas' } },
    },
  },
  '/api/auth/register': {
    post: {
      summary: 'Yangi foydalanuvchi yaratish',
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name', 'phone', 'password'], properties: { name: { type: 'string' }, phone: { type: 'string' }, email: { type: 'string', nullable: true }, password: { type: 'string' } } } } } },
      responses: { 201: { description: 'Created' }, 400: { description: 'Validation error' }, 409: { description: 'User already exists' } },
    },
  },
  '/api/auth/login': {
    post: {
      summary: 'Login qilish',
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['phone', 'password'], properties: { phone: { type: 'string' }, password: { type: 'string' } } } } } },
      responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } },
    },
  },
  '/api/services': {
    get: {
      summary: 'Barcha xizmatlar ro\'yxati',
      responses: { 200: { description: 'List of services' } },
    },
  },
  '/api/services/{id}': {
    get: {
      summary: 'Bitta xizmat ma\'lumotlari',
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Service found' }, 404: { description: 'Not found' } },
    },
  },
  '/api/doctors': {
    get: {
      summary: 'Shifokorlar ro\'yxati',
      responses: { 200: { description: 'List of doctors' } },
    },
  },
  '/api/doctors/{id}': {
    get: {
      summary: 'Bitta shifokor ma\'lumotlari',
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Doctor found' }, 404: { description: 'Not found' } },
    },
  },
  '/api/me': {
    get: {
      summary: 'Joriy foydalanuvchi profili',
      security: [{ BearerAuth: [] }],
      responses: { 200: { description: 'User profile' }, 401: { description: 'Unauthorized' } },
    },
    patch: {
      summary: 'Foydalanuvchi ma\'lumotlarini yangilash',
      security: [{ BearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string', nullable: true }, birthDate: { type: 'string', format: 'date', nullable: true }, avatar: { type: 'string', format: 'uri', nullable: true } } } } } },
      responses: { 200: { description: 'Updated user' }, 400: { description: 'Validation error' }, 401: { description: 'Unauthorized' } },
    },
  },
  '/api/addresses': {
    get: {
      summary: 'Foydalanuvchi manzillari',
      security: [{ BearerAuth: [] }],
      responses: { 200: { description: 'List of addresses' }, 401: { description: 'Unauthorized' } },
    },
    post: {
      summary: 'Yangi manzil qo\'shish',
      security: [{ BearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['label', 'full'], properties: { label: { type: 'string' }, full: { type: 'string' }, district: { type: 'string' }, city: { type: 'string' }, isDefault: { type: 'boolean' } } } } } },
      responses: { 201: { description: 'Address created' }, 400: { description: 'Validation error' }, 401: { description: 'Unauthorized' } },
    },
  },
  '/api/addresses/{id}': {
    patch: {
      summary: 'Manzilni yangilash',
      security: [{ BearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { label: { type: 'string' }, full: { type: 'string' }, district: { type: 'string' }, city: { type: 'string' }, isDefault: { type: 'boolean' } } } } } },
      responses: { 200: { description: 'Address updated' }, 400: { description: 'Validation error' }, 401: { description: 'Unauthorized' }, 404: { description: 'Not found' } },
    },
    delete: {
      summary: 'Manzilni o\'chirish',
      security: [{ BearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 204: { description: 'Deleted' }, 401: { description: 'Unauthorized' }, 404: { description: 'Not found' } },
    },
  },
  '/api/orders': {
    get: {
      summary: 'Buyurtmalar ro\'yxati',
      security: [{ BearerAuth: [] }],
      responses: { 200: { description: 'List of orders' }, 401: { description: 'Unauthorized' } },
    },
    post: {
      summary: 'Buyurtma yaratish',
      security: [{ BearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['serviceId', 'appointmentAt', 'address'], properties: { serviceId: { type: 'string', format: 'uuid' }, doctorId: { type: 'string', format: 'uuid', nullable: true }, appointmentAt: { type: 'string', format: 'date-time' }, address: { type: 'string' }, type: { type: 'string', enum: ['uyga_tashrif', 'onlayn_maslahat'] }, notes: { type: 'string' } } } } } },
      responses: { 201: { description: 'Order created' }, 400: { description: 'Validation error' }, 401: { description: 'Unauthorized' } },
    },
  },
  '/api/orders/{id}': {
    get: {
      summary: 'Bitta buyurtma tafsiloti',
      security: [{ BearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Order found' }, 401: { description: 'Unauthorized' }, 404: { description: 'Not found' } },
    },
  },
  '/api/orders/{id}/cancel': {
    patch: {
      summary: 'Buyurtmani bekor qilish',
      security: [{ BearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Order cancelled' }, 401: { description: 'Unauthorized' }, 409: { description: 'Cannot cancel' } },
    },
  },
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));


const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  ssl:
    process.env.DATABASE_SSL === 'true'
      ? { rejectUnauthorized: false }
      : undefined,
});

let databaseReady = false;
let databaseInitPromise = null;


const idSchema = z.string().uuid();

const asyncRoute = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const initials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .map((x) => x[0] || '')
    .slice(0, 2)
    .join('')
    .toUpperCase();

const userDto = (row) => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  email: row.email,
  birthDate: row.birth_date,
  avatar: row.avatar,
  initials: initials(row.name),
});

const addressDto = (row) => ({
  id: row.id,
  label: row.label,
  full: row.full,
  district: row.district,
  city: row.city,
  isDefault: row.is_default,
});

const signToken = (user) =>
  jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });


app.use(helmet());
app.use(cors({ origin: process.env.MOBILE_APP_ORIGINS || '*' }));
app.use(express.json({ limit: '1mb' }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);


const schema = `
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(32) NOT NULL UNIQUE,
  email VARCHAR(254) UNIQUE,
  password_hash TEXT NOT NULL,
  birth_date DATE,
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(140) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL CHECK(price>=0),
  category VARCHAR(32) NOT NULL CHECK(category IN('muolaja','diagnostika','parvarish','boshqa')),
  icon VARCHAR(80) NOT NULL DEFAULT 'medkit-outline',
  icon_bg VARCHAR(16) NOT NULL DEFAULT '#EBF5FF',
  icon_color VARCHAR(16) NOT NULL DEFAULT '#3B82F6',
  popular BOOLEAN NOT NULL DEFAULT FALSE,
  duration VARCHAR(60),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctors(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(140) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  rating NUMERIC(2,1) NOT NULL DEFAULT 5 CHECK(rating BETWEEN 0 AND 5),
  experience INTEGER NOT NULL DEFAULT 0 CHECK(experience>=0),
  image TEXT NOT NULL DEFAULT '',
  available BOOLEAN NOT NULL DEFAULT TRUE,
  price INTEGER NOT NULL DEFAULT 0 CHECK(price>=0),
  review_count INTEGER NOT NULL DEFAULT 0 CHECK(review_count>=0),
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS addresses(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(60) NOT NULL,
  "full" TEXT NOT NULL,
  district VARCHAR(100) NOT NULL DEFAULT '',
  city VARCHAR(100) NOT NULL DEFAULT '',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS addresses_one_default_per_user
  ON addresses(user_id) WHERE is_default;

CREATE TABLE IF NOT EXISTS orders(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id),
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  appointment_at TIMESTAMPTZ NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  status VARCHAR(24) NOT NULL DEFAULT 'kutilmoqda'
    CHECK(status IN('kutilmoqda','tasdiqlangan','bajarilmoqda','bajarildi','bekor_qilindi')),
  "type" VARCHAR(24) NOT NULL DEFAULT 'uyga_tashrif'
    CHECK("type" IN('uyga_tashrif','onlayn_maslahat')),
  price INTEGER NOT NULL CHECK(price>=0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_user_created_idx
  ON orders(user_id, created_at DESC);`;

async function initializeDatabase() {
  await pool.query(schema);

  const services = [
    [
      'Ukol qilish',
      "Shifokor ko'rsatmasi asosida. Sertifikatlangan hamshira, steril bir martalik anjomlar.",
      60000,
      'muolaja',
      'fitness-outline',
      '#EBF5FF',
      '#3B82F6',
      true,
      '15–30 daq',
    ],
    [
      'Tomchilatma',
      'Uy sharoitida xavfsiz va qulay muolaja. Sertifikatlangan hamshira tomonidan bajariladi.',
      90000,
      'muolaja',
      'water-outline',
      '#E6FAF5',
      '#00C896',
      true,
      '1–2 soat',
    ],
    [
      "Bosim o'lchash",
      'Qon bosimi va yurak urishini professional uskunalar bilan tekshirish.',
      40000,
      'diagnostika',
      'heart-outline',
      '#FFF0F5',
      '#F03E3E',
      false,
      '10 daq',
    ],
    [
      "Yarani bog'lash",
      'Professional parvarish va steril bog‘lam.',
      70000,
      'parvarish',
      'bandage-outline',
      '#FFF4E6',
      '#F59E0B',
      false,
      '20–40 daq',
    ],
    [
      'Qon olish',
      'Laboratoriya tahlili uchun qon olish.',
      50000,
      'diagnostika',
      'flask-outline',
      '#F4F0FF',
      '#8B5CF6',
      false,
      '10 daq',
    ],
    [
      'Massaj',
      'Terapevtik massaj va parvarish.',
      120000,
      'parvarish',
      'hand-left-outline',
      '#FFF0F5',
      '#EC4899',
      false,
      '45–60 daq',
    ],
  ];

  for (const s of services) {
    const exists = await pool.query(
      'SELECT 1 FROM services WHERE name=$1 LIMIT 1',
      [s[0]]
    );

    if (!exists.rowCount) {
      await pool.query(
        `INSERT INTO services(name,description,price,category,icon,icon_bg,icon_color,popular,duration)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        s
      );
    }
  }

  const doctors = [
    ['Dilnoza Rahimova', 'Oilaviy shifokor', 4.9, 12, 'https://randomuser.me/api/portraits/women/44.jpg', true, 150000, 128],
    ['Akmal Saidov', 'Terapevt', 4.8, 9, 'https://randomuser.me/api/portraits/men/32.jpg', true, 130000, 94],
    ['Madina Usmonova', 'Pediatr', 4.9, 8, 'https://randomuser.me/api/portraits/women/68.jpg', true, 140000, 112],
    ['Bobur Karimov', 'Kardiolog', 4.7, 15, 'https://randomuser.me/api/portraits/men/55.jpg', false, 180000, 76],
  ];

  for (const d of doctors) {
    const exists = await pool.query(
      'SELECT 1 FROM doctors WHERE name=$1 LIMIT 1',
      [d[0]]
    );

    if (!exists.rowCount) {
      await pool.query(
        `INSERT INTO doctors(name,specialty,rating,experience,image,available,price,review_count)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,
        d
      );
    }
  }
}

async function initializeDatabaseOnce() {
  if (databaseReady) return;

  if (!databaseInitPromise) {
    databaseInitPromise = initializeDatabase()
      .then(() => {
        databaseReady = true;
      })
      .finally(() => {
        databaseInitPromise = null;
      });
  }

  return databaseInitPromise;
}


async function requireAuth(req, res, next) {
  const header = req.get('authorization') || '';

  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Kirish talab qilinadi.' });
  }

  try {
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    req.userId = decoded.sub;
    next();
  } catch {
    return res
      .status(401)
      .json({ error: 'Token yaroqsiz yoki muddati tugagan.' });
  }
}


app.get(
  '/api/health',
  asyncRoute(async (_req, res) => {
    try {
      await pool.query('SELECT 1');
      await initializeDatabaseOnce();
      res.json({ status: 'ok', database: 'connected' });
    } catch {
      res.status(503).json({
        status: 'starting',
        database: 'disconnected',
        message: 'PostgreSQLga ulanish yo‘q.',
      });
    }
  })
);

app.post(
  '/api/auth/register',
  asyncRoute(async (req, res) => {
    const b = z
      .object({
        name: z.string().trim().min(2).max(120),
        phone: z.string().trim().min(7).max(32),
        email: z.union([z.string().email().max(254), z.literal('')]).optional(),
        password: z.string().min(8).max(128),
      })
      .parse(req.body);

    const hash = await bcrypt.hash(b.password, 12);

    const { rows } = await pool.query(
      'INSERT INTO users(name,phone,email,password_hash) VALUES($1,$2,$3,$4) RETURNING *',
      [b.name, b.phone, b.email || null, hash]
    );

    const user = userDto(rows[0]);
    res.status(201).json({ token: signToken(user), user });
  })
);

app.post(
  '/api/auth/login',
  asyncRoute(async (req, res) => {
    const b = z
      .object({
        phone: z.string().trim().min(7).max(32),
        password: z.string().min(1).max(128),
      })
      .parse(req.body);

    const { rows } = await pool.query('SELECT * FROM users WHERE phone=$1', [
      b.phone,
    ]);

    if (!rows[0] || !(await bcrypt.compare(b.password, rows[0].password_hash))) {
      return res.status(401).json({ error: 'Telefon yoki parol noto‘g‘ri.' });
    }

    const user = userDto(rows[0]);
    res.json({ token: signToken(user), user });
  })
);


const serviceColumns = `
  id, name, description, price, category, icon,
  icon_bg AS "iconBg", icon_color AS "iconColor",
  popular, duration`;

const doctorColumns = `
  id, name, specialty, rating, experience, image,
  available, price, review_count AS "reviewCount"`;

app.get(
  '/api/services',
  asyncRoute(async (_req, res) => {
    const { rows } = await pool.query(
      `SELECT ${serviceColumns} FROM services WHERE active ORDER BY created_at, id`
    );
    res.json(rows);
  })
);

app.get(
  '/api/services/:id',
  asyncRoute(async (req, res) => {
    const id = idSchema.parse(req.params.id);

    const { rows } = await pool.query(
      `SELECT ${serviceColumns} FROM services WHERE id=$1 AND active`,
      [id]
    );

    if (!rows[0]) return res.status(404).json({ error: 'Xizmat topilmadi.' });
    res.json(rows[0]);
  })
);

app.get(
  '/api/doctors',
  asyncRoute(async (_req, res) => {
    const { rows } = await pool.query(
      `SELECT ${doctorColumns} FROM doctors WHERE active ORDER BY name`
    );
    res.json(rows);
  })
);

app.get(
  '/api/doctors/:id',
  asyncRoute(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT ${doctorColumns} FROM doctors WHERE id=$1 AND active`,
      [idSchema.parse(req.params.id)]
    );

    if (!rows[0]) return res.status(404).json({ error: 'Shifokor topilmadi.' });
    res.json(rows[0]);
  })
);


app.get(
  '/api/me',
  requireAuth,
  asyncRoute(async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM users WHERE id=$1', [
      req.userId,
    ]);

    if (!rows[0]) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi.' });
    }

    const a = await pool.query(
      'SELECT * FROM addresses WHERE user_id=$1 ORDER BY is_default DESC, created_at',
      [req.userId]
    );

    res.json({
      ...userDto(rows[0]),
      addresses: a.rows.map(addressDto),
      currentLocation: a.rows.find((x) => x.is_default)?.district || '',
    });
  })
);

app.patch(
  '/api/me',
  requireAuth,
  asyncRoute(async (req, res) => {
    const b = z
      .object({
        name: z.string().trim().min(2).max(120).optional(),
        email: z.string().email().max(254).nullable().optional(),
        birthDate: z.string().date().nullable().optional(),
        avatar: z.string().url().nullable().optional(),
      })
      .strict()
      .parse(req.body);

    const map = {
      name: 'name',
      email: 'email',
      birthDate: 'birth_date',
      avatar: 'avatar',
    };

    const set = [];
    const vals = [];

    for (const [k, v] of Object.entries(b)) {
      vals.push(v);
      set.push(`${map[k]}=$${vals.length}`);
    }

    if (!set.length) {
      return res.status(400).json({ error: 'Yangilanadigan maydon berilmadi.' });
    }

    vals.push(req.userId);

    const { rows } = await pool.query(
      `UPDATE users SET ${set.join(',')}, updated_at=NOW() WHERE id=$${vals.length} RETURNING *`,
      vals
    );

    res.json(userDto(rows[0]));
  })
);


const addressSchema = z.object({
  label: z.string().trim().min(1).max(60),
  full: z.string().trim().min(5).max(500),
  district: z.string().trim().max(100).default(''),
  city: z.string().trim().max(100).default(''),
  isDefault: z.boolean().default(false),
});

app.get(
  '/api/addresses',
  requireAuth,
  asyncRoute(async (req, res) => {
    const { rows } = await pool.query(
      'SELECT * FROM addresses WHERE user_id=$1 ORDER BY is_default DESC, created_at',
      [req.userId]
    );
    res.json(rows.map(addressDto));
  })
);

app.post(
  '/api/addresses',
  requireAuth,
  asyncRoute(async (req, res) => {
    const b = addressSchema.parse(req.body);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      if (b.isDefault) {
        await client.query(
          'UPDATE addresses SET is_default=FALSE WHERE user_id=$1',
          [req.userId]
        );
      }

      const { rows } = await client.query(
        `INSERT INTO addresses(user_id,label,"full",district,city,is_default)
         VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
        [req.userId, b.label, b.full, b.district, b.city, b.isDefault]
      );

      await client.query('COMMIT');
      res.status(201).json(addressDto(rows[0]));
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  })
);

app.patch(
  '/api/addresses/:id',
  requireAuth,
  asyncRoute(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const b = addressSchema.partial().strict().parse(req.body);

    if (!Object.keys(b).length) {
      return res.status(400).json({ error: 'Yangilanadigan maydon yo‘q.' });
    }

    const cols = {
      label: 'label',
      full: '"full"',
      district: 'district',
      city: 'city',
      isDefault: 'is_default',
    };
    const sets = [];
    const vals = [];

    if (b.isDefault) {
      await pool.query(
        'UPDATE addresses SET is_default=FALSE WHERE user_id=$1',
        [req.userId]
      );
    }

    for (const [k, v] of Object.entries(b)) {
      vals.push(v);
      sets.push(`${cols[k]}=$${vals.length}`);
    }

    vals.push(id, req.userId);

    const { rows } = await pool.query(
      `UPDATE addresses SET ${sets.join(',')}
       WHERE id=$${vals.length - 1} AND user_id=$${vals.length} RETURNING *`,
      vals
    );

    if (!rows[0]) return res.status(404).json({ error: 'Manzil topilmadi.' });
    res.json(addressDto(rows[0]));
  })
);

app.delete(
  '/api/addresses/:id',
  requireAuth,
  asyncRoute(async (req, res) => {
    const { rowCount } = await pool.query(
      'DELETE FROM addresses WHERE id=$1 AND user_id=$2',
      [idSchema.parse(req.params.id), req.userId]
    );

    if (!rowCount) return res.status(404).json({ error: 'Manzil topilmadi.' });
    res.status(204).end();
  })
);


const orderSelect = `
SELECT
  o.id, o.appointment_at, o.address, o.status, o."type", o.price, o.created_at,
  json_build_object(
    'id', s.id,
    'name', s.name,
    'description', s.description,
    'price', s.price,
    'category', s.category,
    'icon', s.icon,
    'iconBg', s.icon_bg,
    'iconColor', s.icon_color,
    'popular', s.popular,
    'duration', s.duration
  ) AS service,
  CASE WHEN d.id IS NULL THEN NULL ELSE json_build_object(
    'id', d.id,
    'name', d.name,
    'specialty', d.specialty,
    'rating', d.rating,
    'experience', d.experience,
    'image', d.image,
    'available', d.available,
    'price', d.price,
    'reviewCount', d.review_count
  ) END AS doctor
FROM orders o
JOIN services s ON s.id = o.service_id
LEFT JOIN doctors d ON d.id = o.doctor_id`;

const orderDto = (r) => ({
  ...r,
  date: new Date(r.appointment_at).toISOString().slice(0, 10),
  time: new Date(r.appointment_at).toISOString().slice(11, 16),
  createdAt: r.created_at,
});

app.get(
  '/api/orders',
  requireAuth,
  asyncRoute(async (req, res) => {
    const { rows } = await pool.query(
      `${orderSelect} WHERE o.user_id=$1 ORDER BY o.created_at DESC`,
      [req.userId]
    );
    res.json(rows.map(orderDto));
  })
);

app.get(
  '/api/orders/:id',
  requireAuth,
  asyncRoute(async (req, res) => {
    const { rows } = await pool.query(
      `${orderSelect} WHERE o.user_id=$1 AND o.id=$2`,
      [req.userId, idSchema.parse(req.params.id)]
    );

    if (!rows[0]) return res.status(404).json({ error: 'Buyurtma topilmadi.' });
    res.json(orderDto(rows[0]));
  })
);

app.post(
  '/api/orders',
  requireAuth,
  asyncRoute(async (req, res) => {
    const b = z
      .object({
        serviceId: idSchema,
        doctorId: idSchema.nullable().optional(),
        appointmentAt: z.string().datetime({ offset: true }),
        address: z.string().trim().min(5).max(500),
        type: z.enum(['uyga_tashrif', 'onlayn_maslahat']).default('uyga_tashrif'),
        notes: z.string().max(1000).optional(),
      })
      .parse(req.body);

    const s = await pool.query(
      'SELECT price FROM services WHERE id=$1 AND active',
      [b.serviceId]
    );
    if (!s.rows[0]) {
      return res.status(400).json({ error: 'Xizmat topilmadi.' });
    }

    if (b.doctorId) {
      const d = await pool.query(
        'SELECT 1 FROM doctors WHERE id=$1 AND active',
        [b.doctorId]
      );
      if (!d.rowCount) {
        return res.status(400).json({ error: 'Shifokor topilmadi.' });
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO orders(user_id,service_id,doctor_id,appointment_at,address,"type",price,notes)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [
        req.userId,
        b.serviceId,
        b.doctorId || null,
        b.appointmentAt,
        b.address,
        b.type,
        s.rows[0].price,
        b.notes || null,
      ]
    );

    const r = await pool.query(`${orderSelect} WHERE o.id=$1`, [rows[0].id]);
    res.status(201).json(orderDto(r.rows[0]));
  })
);

app.patch(
  '/api/orders/:id/cancel',
  requireAuth,
  asyncRoute(async (req, res) => {
    const { rows } = await pool.query(
      `UPDATE orders SET status='bekor_qilindi', updated_at=NOW()
       WHERE id=$1 AND user_id=$2 AND status='kutilmoqda' RETURNING id`,
      [idSchema.parse(req.params.id), req.userId]
    );

    if (!rows[0]) {
      return res.status(409).json({ error: 'Buyurtmani bekor qilib bo‘lmadi.' });
    }

    const r = await pool.query(`${orderSelect} WHERE o.id=$1`, [rows[0].id]);
    res.json(orderDto(r.rows[0]));
  })
);


app.get('/api-docs.json', (_req, res) => {
  res.json(swaggerSpec);
});

app.use((req, res) => res.status(404).json({ error: 'Endpoint topilmadi.' }));

app.use((err, _req, res, _next) => {
  console.error(err);

  if (err instanceof ZodError) {
    return res
      .status(400)
      .json({ error: err.issues[0]?.message || 'Ma’lumot noto‘g‘ri.' });
  }
  if (err.code === '23505') {
    return res
      .status(409)
      .json({ error: 'Telefon raqami yoki email avval ro‘yxatdan o‘tgan.' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Bog‘langan yozuv topilmadi.' });
  }

  res.status(500).json({ error: 'Serverda xatolik yuz berdi.' });
});


async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error(
      'JWT_SECRET kamida 32 belgidan iborat bo‘lishi kerak. .env fayl yarating.'
    );
  }

  app.listen(port, '0.0.0.0', () =>
    console.log(`Hamshira API: http://localhost:${port}`),
  );

  const tryDatabase = () =>
    initializeDatabaseOnce()
      .then(() =>
        console.log('PostgreSQL schema tayyor, catalog seed qilindi.')
      )
      .catch((error) =>
        console.error('PostgreSQL ulanmagan, qayta uriniladi:', String(error))
      );

  await tryDatabase();
  setInterval(tryDatabase, 10_000).unref();
}

if (require.main === module) {
  start().catch((error) => {
    console.error('Server start failed:', error);
    process.exit(1);
  });
}

module.exports = { app, pool, start };