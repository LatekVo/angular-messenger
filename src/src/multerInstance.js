const multer = require('multer');
const storage = multer.memoryStorage(); // RAM storage, this is not standard for Multer but we have to process the image before saving it, so it's necessary.
const upload = multer({ storage: storage });

module.exports = upload;
