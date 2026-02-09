
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = `uploads/${req.uploadFolder}`;
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueName + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = req.allowedTypes;
    if (!allowedTypes || allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                `Invalid file type. Allowed: ${allowedTypes.join(", ")}`
            ),
            false
        );
    }
};

const upload = multer({
    storage,
    fileFilter,
    // limits: {
    //     fileSize: 5 * 1024 * 1024, // 5MB
    // },
});

module.exports = upload;
