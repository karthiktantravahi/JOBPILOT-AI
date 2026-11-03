import multer from 'multer';
import { ENV } from '../config/env.js';

const storage = multer.memoryStorage();

export const uploadResume = multer({
  storage,
  limits: {
    fileSize: ENV.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/pdf' ||
      file.originalname.toLowerCase().endsWith('.pdf')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF documents are supported.'), false);
    }
  },
});
