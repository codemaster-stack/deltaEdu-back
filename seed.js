'use strict';

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const bcrypt   = require('bcryptjs');

dotenv.config();

const User   = require('./models/User');
const School = require('./models/School');
const News   = require('./models/News');

const SCHOOLS = [
  { name: 'Government Secondary School, Asaba',      type: 'secondary', lga: 'Oshimili South',  students: 1240, teachers: 48, principal: 'Mr. C. Okonkwo',  phone: '08031234567', status: 'active'   },
  { name: 'Community Primary School, Warri',          type: 'primary',   lga: 'Warri South',     students: 680,  teachers: 22, principal: 'Mrs. A. Efiewi',  phone: '08051234567', status: 'active'   },
  { name: 'Delta State Science Secondary School',     type: 'secondary', lga: 'Ethiope East',    students: 980,  teachers: 54, principal: 'Dr. E. Nwosu',    phone: '08071234567', status: 'active'   },
  { name: 'Girls Secondary School, Agbor',            type: 'secondary', lga: 'Ika South',       students: 870,  teachers: 39, principal: 'Mrs. F. Okoro',   phone: '08091234567', status: 'active'   },
  { name: 'Central Primary School, Abraka',           type: 'primary',   lga: 'Ethiope East',    students: 540,  teachers: 18, principal: 'Mr. J. Enenmo',   phone: '08011234567', status: 'active'   },
  { name: "St. Patrick's Secondary School, Asaba",    type: 'secondary', lga: 'Oshimili South',  students: 1100, teachers: 52, principal: 'Rev. P. Amadi',   phone: '08061234567', status: 'active'   },
  { name: 'Nsukwa Primary School, Kwale',             type: 'primary',   lga: 'Ndokwa West',     students: 390,  teachers: 14, principal: 'Mrs. G. Ibe',     phone: '08021234567', status: 'active'   },
  { name: 'Technical College, Sapele',                type: 'secondary', lga: 'Sapele',          students: 760,  teachers: 35, principal: 'Engr. D. Salami', phone: '08041234567', status: 'active'   },
  { name: 'Ughelli Model Primary School',             type: 'primary',   lga: 'Ughelli North',   students: 610,  teachers: 20, principal: 'Mrs. O. Ufuoma',  phone: '08081234567', status: 'active'   },
  { name: 'Unity Secondary School, Ozoro',            type: 'secondary', lga: 'Isoko North',     students: 920,  teachers: 43, principal: 'Mr. B. Ijale',    phone: '08031239999', status: 'active'   },
  { name: 'Infant Jesus Primary School, Warri',       type: 'primary',   lga: 'Warri South',     students: 720,  teachers: 25, principal: 'Sr. M. Francis',  phone: '08051239999', status: 'active'   },
  { name: 'Government Comprehensive School, Agbor',   type: 'secondary', lga: 'Ika South',       students: 1050, teachers: 47, principal: 'Mrs. C. Anigbo',  phone: '08071239999', status: 'inactive' },
];

const NEWS = [
  { title: '2024/2025 WAEC Registration Now Open for All SS3 Students',        excerpt: 'The Ministry announces commencement of WAEC registration for all final-year secondary school students. Deadline is April 30th, 2025.', category: 'Examination',    icon: '📋', colour: 'gold',  featured: true  },
  { title: 'New Classroom Blocks Commissioned in 42 Primary Schools',           excerpt: 'Governor inaugurates modern classroom facilities across 42 primary schools as part of the Education Infrastructure Drive 2025.',        category: 'Infrastructure', icon: '🏫', colour: 'green', featured: false },
  { title: 'Teacher Professional Development Programme Kicks Off',              excerpt: 'Over 3,000 teachers have enrolled in the state-wide continuous education and skills development initiative.',                           category: 'Training',       icon: '📚', colour: 'blue',  featured: false },
  { title: '2025 Common Entrance Examination Results Released',                 excerpt: 'Results for the Delta State Common Entrance Examination into Junior Secondary Schools are now available on the portal.',                category: 'Results',        icon: '🎓', colour: 'gold',  featured: false },
  { title: 'Digital Portal Training Workshop for School Administrators',        excerpt: 'Principals and Headteachers across the state completed a two-day digital literacy workshop to onboard the new Education Portal.',       category: 'Technology',     icon: '💻', colour: 'blue',  featured: false },
  { title: 'Ministry Releases Updated Teacher Posting Guidelines',              excerpt: 'The updated guidelines for teacher postings and transfers take effect from the 2025/2026 academic session.',                            category: 'Policy',         icon: '📄', colour: 'gold',  featured: false },
  { title: 'NECO Internal Examination Timetable Released',                      excerpt: 'The schedule for the 2025 Senior School Certificate Examination (SSCE) Internal is now available for download.',                       category: 'Examination',    icon: '📝', colour: 'green', featured: false },
  { title: 'Renovation Works Begin in 18 Secondary Schools Across Delta North', excerpt: 'Contractors have mobilised to sites across 18 secondary schools in the Delta North senatorial district.',                              category: 'Infrastructure', icon: '🏗️', colour: 'grey',  featured: false },
];

const ADMIN_USER = {
  name:     'Ministry Admin',
  email:    'admin@deltaedu.gov.ng',
  password: 'Admin@12345',
  role:     'ministry_admin',
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      School.deleteMany({}),
      News.deleteMany({}),
    ]);
    console.log('Cleared existing schools and news');

    // Check if admin exists before creating
    const existingAdmin = await User.findOne({ email: ADMIN_USER.email });
    if (!existingAdmin) {
      await User.create(ADMIN_USER);
      console.log(`Admin user created — email: ${ADMIN_USER.email} password: ${ADMIN_USER.password}`);
    } else {
      console.log('Admin user already exists — skipping');
    }

    // Seed schools and news
    await School.insertMany(SCHOOLS);
    console.log(`${SCHOOLS.length} schools seeded`);

    await News.insertMany(NEWS);
    console.log(`${NEWS.length} news items seeded`);

    console.log('✅ Seed complete');
    process.exit(0);

  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();