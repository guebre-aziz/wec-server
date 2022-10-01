const express = require("express");
const router = express.Router();
const { adminAuth } = require("../../middleware/auth");
const usersController = require("../controllers/users-controller");
const postsController = require("../controllers/posts-controller");
const authController = require("../controllers/auth-controller");
const userUpload = require("../../services/userUpload");
const postUpload = require("../../services/postUpload");

// User API
router.get("/users/network/:username", adminAuth, usersController.getNetwork);
router.get("/users/search/:searchKey", adminAuth, usersController.searchUsers);
router.get("/users/:username", adminAuth, usersController.getUser);
router.put(
  "/users/:username/followUnfollow",
  adminAuth,
  usersController.followUnfollowUser
);
router.put(
  "/users/:username",
  [adminAuth, userUpload],
  usersController.updateUser
);
router.delete("/users", adminAuth, usersController.deleteAccount);

// Post API
router.get("/posts/timeline", adminAuth, postsController.getTimeline);
router.get("/posts/getById/:id", adminAuth, postsController.getPost);
router.get("/posts/:username", adminAuth, postsController.getUserPosts);
router.post("/posts", [adminAuth, postUpload], postsController.createPost);
router.delete("/posts/:id", adminAuth, postsController.deletePost);

// Auth API
router.post("/auth/register", userUpload, authController.registerUser);
router.post("/auth/login", authController.login);

module.exports = router;
