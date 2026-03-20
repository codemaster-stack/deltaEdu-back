const cloudinary = require('cloudinary').v2;
const multer     = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage for videos
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:        'delta-edu/lessons',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    transformation: [{ quality: 'auto' }],
  },
});

const uploadVideo = multer({
  storage: videoStorage,
  limits:  { fileSize: 500 * 1024 * 1024 }, // 500MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are accepted (mp4, mov, avi, webm, mkv).'));
    }
  },
});

// POST /api/v1/upload/video
const uploadLessonVideo = (req, res, next) => {
  uploadVideo.single('video')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: 'Please upload a video file.' });

    try {
      res.json({
        url:      req.file.path,
        publicId: req.file.filename,
        duration: req.file.duration || null,
      });
    } catch (err) {
      next(err);
    }
  });
};

// DELETE /api/v1/upload/video/:publicId
const deleteLessonVideo = async (req, res, next) => {
  try {
    await cloudinary.uploader.destroy(req.params.publicId, { resource_type: 'video' });
    res.json({ message: 'Video deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadLessonVideo, deleteLessonVideo };