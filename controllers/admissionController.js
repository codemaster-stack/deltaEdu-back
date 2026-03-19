const Admission = require('../models/Admission');

// GET /api/v1/admissions
const getAdmissions = async (req, res, next) => {
  try {
    const { status, lga, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (lga)    filter.lga    = lga;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { ref:  { $regex: search, $options: 'i' } },
      ];
    }

    const admissions = await Admission.find(filter).sort({ createdAt: -1 });
    res.json({ admissions });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/admissions/:ref — track by ref number
const getAdmissionByRef = async (req, res, next) => {
  try {
    const admission = await Admission.findOne({ ref: req.params.ref.toUpperCase() });
    if (!admission) {
      return res.status(404).json({ message: 'No application found with this reference number.' });
    }
    res.json({ admission });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/admissions
const createAdmission = async (req, res, next) => {
  try {
    const { name, dob, gender, class: cls, school, lga, guardian, phone } = req.body;

    if (!name || !cls || !school || !lga) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    const admission = await Admission.create({ name, dob, gender, class: cls, school, lga, guardian, phone });
    res.status(201).json({ admission });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/admissions/:ref/status
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'approved', 'waitlisted', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const admission = await Admission.findOneAndUpdate(
      { ref: req.params.ref.toUpperCase() },
      { status },
      { new: true }
    );

    if (!admission) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    res.json({ admission });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAdmissions, getAdmissionByRef, createAdmission, updateStatus };