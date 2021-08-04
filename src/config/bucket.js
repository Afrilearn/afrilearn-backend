//todo: change storage to multerS3 and change filepath in product-router to 'location'
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

// const path = require("path");
// const dirPath = path.join(__dirname, "./config.json");
// // const dirPath = path.join(__dirname, "./../../config.json");

// aws.config.loadFromPath(dirPath);
aws.config.update({
  secretAccessKey: process.env.S3_ACCESS_SECRET,
  accessKeyId: process.env.S3_ACCESS_KEY,
  region: "eu-west-3",
  AWS_SDK_LOAD_CONFIG: 1,
});
const s3 = new aws.S3();

const storage = multerS3({
  acl: "public-read",
  s3,
  bucket: "afrilearn-media/profile-photos",
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "images");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + file.originalname);
//   },
// });

const upload = multer({
  storage: storage,
  // limits: {
  //   fileSize: 10000000, //1mb
  // },
  // fileFilter(req, file, cb) {
  //   if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
  //     return cb(new Error("Kindly upload an image"));
  //   }
  //   cb(undefined, true);

  //   // cb(new Error("File Upload failed!!"));
  //   // cb(undefined, true); //no error & upload should be accepted
  //   // cb(undefined, false); //no error & upload should be silently rejected
  // },
});

module.exports = upload;
