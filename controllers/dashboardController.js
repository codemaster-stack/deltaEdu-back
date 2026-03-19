const School  = require('../models/School');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const News    = require('../models/News');

// GET /api/v1/dashboard/overview
const getOverview = async (req, res, next) => {
  try {
    const [totalSchools, totalTeachers, totalStudents, recentNews] = await Promise.all([
      School.countDocuments(),
      Teacher.countDocuments(),
      Student.countDocuments(),
      News.find().sort({ createdAt: -1 }).limit(6),
    ]);

    // Schools by type for donut chart
    const primaryCount   = await School.countDocuments({ type: 'primary' });
    const secondaryCount = await School.countDocuments({ type: 'secondary' });

    // KPI cards
    const kpis = [
      { label: 'Total Schools',    value: totalSchools,  change: '+12',   trend: 'up',   icon: '🏫', colour: 'gold'  },
      { label: 'Active Teachers',  value: totalTeachers, change: '+340',  trend: 'up',   icon: '👩‍🏫', colour: 'green' },
      { label: 'Enrolled Students',value: totalStudents, change: '+5.2%', trend: 'up',   icon: '🎓', colour: 'blue'  },
      { label: 'LGAs Covered',     value: 25,            change: '100%',  trend: 'flat', icon: '📍', colour: 'navy'  },
    ];

    // Donut chart data
    const donut = [
      { label: 'Primary Schools',   value: primaryCount,   colour: '#C9922A' },
      { label: 'Secondary Schools', value: secondaryCount, colour: '#1A6B4A' },
    ];

    // Activity feed from recent news
    const activity = recentNews.map(n => ({
      icon:   n.icon,
      colour: n.colour,
      desc:   n.title,
      time:   timeAgo(n.createdAt),
    }));

    res.json({ kpis, donut, activity });

  } catch (err) {
    next(err);
  }
};

// Helper — time ago
function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60)     return 'Just now';
  if (seconds < 3600)   return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400)  return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return new Date(date).toLocaleDateString('en-NG');
}

module.exports = { getOverview };