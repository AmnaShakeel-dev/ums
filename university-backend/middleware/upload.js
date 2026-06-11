const multer = require("multer");
const path = require("path");

// File kahan save hogi aur kya naam hoga
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },

    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1000000000)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

// Konsi files allow hain
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "video/mp4",
        "video/mkv",
        "image/jpeg",
        "image/png",
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX, MP4, MKV, JPG, PNG allowed."), false);
    }
};

// Multer setup
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 10485760,
    },
});

// Single file upload
const uploadSingle = upload.single("file");

// Profile photo upload
const uploadPhoto = upload.single("photo");

// Error handle karo
const handleUpload = (uploadMiddleware) => {
    return (req, res, next) => {
        uploadMiddleware(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({
                        success: false,
                        message: "File too large. Maximum size is 10MB.",
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: err.message,
                });
            }

            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message,
                });
            }

            next();
        });
    };
};

module.exports = {
    uploadSingle: handleUpload(uploadSingle),
    uploadPhoto: handleUpload(uploadPhoto),
};