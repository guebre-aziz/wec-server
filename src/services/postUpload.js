const fs = require("fs");
const multer = require("multer");

const uploadDirectory = "./public";
const imagesPath = `${uploadDirectory}/images`;
const postsImagesPath = `${imagesPath}/posts`;

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

if (!fs.existsSync(imagesPath)) {
  fs.mkdirSync(imagesPath);
}

if (!fs.existsSync(postsImagesPath)) {
  fs.mkdirSync(postsImagesPath);
}

const Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, postsImagesPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: Storage,
}).fields([{ name: "postImages" }]);

module.exports = upload;
