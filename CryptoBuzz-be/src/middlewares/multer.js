
import multer from "multer";
import path from "path";


const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "video/mp4"];

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

        const ext = path.extname(file.originalname);
        const cleanName = path
            .basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9]/g, "");

        cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
    },
});

function fileFilter(req, file, cb) {
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error("Invalid file type"));
    }
    cb(null, true);
}

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
    },
});
