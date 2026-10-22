require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const pool = require('./pool');
const services = [
 ['1','Ukol qilish',"Shifokor ko'rsatmasi asosida. Sertifikatlangan hamshira, steril anjomlar.",60000,'muolaja','fitness-outline','#EBF5FF','#3B82F6',true,'15–30 daq'],
 ['2','Tomchilatma','Uy sharoitida xavfsiz va qulay muolaja.',90000,'muolaja','water-outline','#E6FAF5','#00C896',true,'1–2 soat'],
 ['3',"Bosim o'lchash",'Qon bosimi va yurak urishini tekshirish.',40000,'diagnostika','heart-outline','#FFF0F5','#F03E3E',false,'10 daq'],
 ['4',"Yarani bog'lash",'Steril materiallar bilan professional parvarish.',70000,'parvarish','bandage-outline','#FFF4E6','#F59E0B',false,'20–40 daq'],
 ['5','Qon olish','Laboratoriya tahlili uchun qon olish.',50000,'diagnostika','flask-outline','#F4F0FF','#8B5CF6',false,'10 daq'],
 ['6','Massaj','Terapevtik massaj va parvarish.',120000,'parvarish','hand-left-outline','#FFF0F5','#EC4899',false,'45–60 daq'],
];
const doctors = [
 ['1','Dilnoza Rahimova','Oilaviy shifokor',4.9,12,'https://randomuser.me/api/portraits/women/44.jpg',true,150000,128],
 ['2','Akmal Saidov','Terapevt',4.8,9,'https://randomuser.me/api/portraits/men/32.jpg',true,130000,94],
 ['3','Madina Usmonova','Pediatr',4.9,8,'https://randomuser.me/api/portraits/women/68.jpg',true,140000,112],
 ['4','Bobur Karimov','Kardiolog',4.7,15,'https://randomuser.me/api/portraits/men/55.jpg',false,180000,76],
];
async function init() {
 const client = await pool.connect();
 try {
  await client.query('BEGIN');
  await client.query(fs.readFileSync(path.join(__dirname,'schema.sql'),'utf8'));
  for (const s of services) await client.query(`INSERT INTO services(id,name,description,price,category,icon,icon_bg,icon_color,popular,duration) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT(id) DO NOTHING`,[`00000000-0000-4000-8000-${s[0].padStart(12,'0')}`,...s.slice(1)]);
  for (const d of doctors) await client.query(`INSERT INTO doctors(id,name,specialty,rating,experience,image,available,price,review_count) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(id) DO NOTHING`,[`00000000-0000-4000-8000-${d[0].padStart(12,'0')}`,...d.slice(1)]);
  await client.query('COMMIT'); console.log('PostgreSQL schema initialized and catalog seeded.');
 } catch(e) { await client.query('ROLLBACK'); throw e; }
 finally { client.release(); await pool.end(); }
}
init().catch(e=>{console.error('Database initialization failed:',e.message);process.exitCode=1;});
