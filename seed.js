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

const TEACHERS = [
  { name: 'Mrs. Adaeze Okonkwo',    gender: 'female', subject: 'Mathematics',        school: 'Government Secondary School, Asaba',    lga: 'Oshimili South', level: 'secondary', status: 'active',      years: 12, phone: '08031234567' },
  { name: 'Mr. Emmanuel Ufuoma',    gender: 'male',   subject: 'Physics',             school: 'Delta State Science Secondary School',  lga: 'Ethiope East',   level: 'secondary', status: 'active',      years: 8,  phone: '08051234567' },
  { name: 'Mrs. Blessing Efiewi',   gender: 'female', subject: 'English Language',    school: 'Community Primary School, Warri',       lga: 'Warri South',    level: 'primary',   status: 'active',      years: 15, phone: '08071234567' },
  { name: 'Mr. Chukwuemeka Nwosu',  gender: 'male',   subject: 'Chemistry',           school: 'Girls Secondary School, Agbor',         lga: 'Ika South',      level: 'secondary', status: 'on-leave',    years: 6,  phone: '08091234567' },
  { name: 'Mrs. Grace Ibe',         gender: 'female', subject: 'Social Studies',      school: 'Nsukwa Primary School, Kwale',          lga: 'Ndokwa West',    level: 'primary',   status: 'active',      years: 10, phone: '08011234567' },
  { name: 'Mr. David Salami',       gender: 'male',   subject: 'ICT',                 school: 'Technical College, Sapele',             lga: 'Sapele',         level: 'secondary', status: 'active',      years: 4,  phone: '08061234567' },
  { name: 'Mrs. Obiageli Ufuoma',   gender: 'female', subject: 'Biology',             school: 'Ughelli Model Primary School',          lga: 'Ughelli North',  level: 'primary',   status: 'active',      years: 9,  phone: '08021234567' },
  { name: 'Mr. Benjamin Ijale',     gender: 'male',   subject: 'Government',          school: 'Unity Secondary School, Ozoro',         lga: 'Isoko North',    level: 'secondary', status: 'active',      years: 11, phone: '08041234567' },
  { name: 'Mrs. Chidinma Anigbo',   gender: 'female', subject: 'Economics',           school: 'Government Comprehensive School, Agbor',lga: 'Ika South',      level: 'secondary', status: 'transferred', years: 7,  phone: '08081234567' },
  { name: 'Mr. Festus Enenmo',      gender: 'male',   subject: 'Agricultural Science',school: 'Central Primary School, Abraka',        lga: 'Ethiope East',   level: 'primary',   status: 'active',      years: 13, phone: '08031239999' },
  { name: 'Mrs. Patricia Amadi',    gender: 'female', subject: 'Literature',          school: "St. Patrick's Secondary School, Asaba", lga: 'Oshimili South', level: 'secondary', status: 'active',      years: 5,  phone: '08051239999' },
  { name: 'Mr. Sunday Okoro',       gender: 'male',   subject: 'Physical Education',  school: 'Girls Secondary School, Agbor',         lga: 'Ika South',      level: 'secondary', status: 'retired',     years: 35, phone: '08071239999' },
];

const STUDENTS = [
  { studentId: 'DSS/2024/001001', name: 'Chioma Okafor',   gender: 'female', dob: '2008-03-15', class: 'SSS 2', level: 'secondary', school: 'Government Secondary School, Asaba',    lga: 'Oshimili South', guardian: 'Mr. Okafor',   phone: '08031234001', status: 'active'     },
  { studentId: 'DSS/2024/001002', name: 'Emeka Eze',        gender: 'male',   dob: '2009-07-22', class: 'SSS 1', level: 'secondary', school: 'Government Secondary School, Asaba',    lga: 'Oshimili South', guardian: 'Mrs. Eze',     phone: '08031234002', status: 'active'     },
  { studentId: 'DSS/2024/001003', name: 'Ngozi Obi',        gender: 'female', dob: '2010-01-10', class: 'JSS 3', level: 'secondary', school: 'Girls Secondary School, Agbor',         lga: 'Ika South',      guardian: 'Mr. Obi',      phone: '08031234003', status: 'active'     },
  { studentId: 'DSS/2024/001004', name: 'Tunde Adeyemi',    gender: 'male',   dob: '2007-11-05', class: 'SSS 3', level: 'secondary', school: 'Delta State Science Secondary School',  lga: 'Ethiope East',   guardian: 'Mrs. Adeyemi', phone: '08031234004', status: 'active'     },
  { studentId: 'DSS/2024/001005', name: 'Amaka Nwosu',      gender: 'female', dob: '2011-06-18', class: 'JSS 1', level: 'secondary', school: 'Unity Secondary School, Ozoro',         lga: 'Isoko North',    guardian: 'Mr. Nwosu',    phone: '08031234005', status: 'active'     },
  { studentId: 'DSS/2024/001006', name: 'Samuel Oghene',    gender: 'male',   dob: '2012-09-30', class: 'Primary 5', level: 'primary', school: 'Community Primary School, Warri',    lga: 'Warri South',    guardian: 'Mrs. Oghene',  phone: '08031234006', status: 'active'     },
  { studentId: 'DSS/2024/001007', name: 'Amara Nwosu',      gender: 'female', dob: '2008-04-12', class: 'SSS 2', level: 'secondary', school: 'Girls Secondary School, Agbor',         lga: 'Ika South',      guardian: 'Mr. Nwosu',    phone: '08031234007', status: 'active'     },
  { studentId: 'DSS/2024/001008', name: 'David Efe',         gender: 'male',   dob: '2013-02-28', class: 'Primary 4', level: 'primary', school: 'Central Primary School, Abraka',    lga: 'Ethiope East',   guardian: 'Mrs. Efe',     phone: '08031234008', status: 'active'     },
  { studentId: 'DSS/2024/001009', name: 'Blessing Okpara',  gender: 'female', dob: '2007-08-14', class: 'SSS 3', level: 'secondary', school: "St. Patrick's Secondary School, Asaba", lga: 'Oshimili South', guardian: 'Mr. Okpara',   phone: '08031234009', status: 'graduated'  },
  { studentId: 'DSS/2024/001010', name: 'Chidi Eze',         gender: 'male',   dob: '2009-12-03', class: 'SSS 1', level: 'secondary', school: 'Technical College, Sapele',             lga: 'Sapele',         guardian: 'Mrs. Eze',     phone: '08031234010', status: 'active'     },
  { studentId: 'DSS/2024/001011', name: 'Patience Ijale',   gender: 'female', dob: '2011-05-20', class: 'JSS 2', level: 'secondary', school: 'Unity Secondary School, Ozoro',         lga: 'Isoko North',    guardian: 'Mr. Ijale',    phone: '08031234011', status: 'withdrawn'  },
  { studentId: 'DSS/2024/001012', name: 'Victor Salami',    gender: 'male',   dob: '2010-10-08', class: 'JSS 3', level: 'secondary', school: 'Technical College, Sapele',             lga: 'Sapele',         guardian: 'Mrs. Salami',  phone: '08031234012', status: 'transferred'},
];

const Teacher = require('./models/Teacher');
    const Student = require('./models/Student');

    await Teacher.deleteMany({});
    await Student.deleteMany({});

    await Teacher.insertMany(TEACHERS);
    console.log(`${TEACHERS.length} teachers seeded`);

    await Student.insertMany(STUDENTS);
    console.log(`${STUDENTS.length} students seeded`);

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