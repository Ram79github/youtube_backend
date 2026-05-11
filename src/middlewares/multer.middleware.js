import multer from "multer";


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {

    cb(null, file.originalname)
  }
})

 export const upload = multer({
      storage,
      fileFilter: (req, file, cb) => {
        // Log field names for debugging
        console.log('Received field name:', file.fieldname);

        // Allow only avatar and coverImage fields
        if (file.fieldname === 'avatar' || file.fieldname === 'coverImage') {
          cb(null, true);
        } else {
          cb(new Error(`Unexpected field: ${file.fieldname}. Expected: avatar or coverImage`), false);
        }
      }
    })