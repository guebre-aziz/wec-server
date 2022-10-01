const fs = require("fs");
const multer = require("multer");

const uploadDirectory = "./public";
const imagesPath = `${uploadDirectory}/images`;
const usersImagesPath = `${imagesPath}/users`;

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

if (!fs.existsSync(imagesPath)) {
  fs.mkdirSync(imagesPath);
}

if (!fs.existsSync(usersImagesPath)) {
  fs.mkdirSync(usersImagesPath);
}

const Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, usersImagesPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const userUpload = multer({
  storage: Storage,
}).fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "coverPicture", maxCount: 1 },
]);

module.exports = userUpload;
