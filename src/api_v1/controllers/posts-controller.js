const Post = require("../model/posts-model");
const User = require("../model/users-model");
const ObjectId = require("mongoose").Types.ObjectId;
const fs = require("fs");
const isEmpty = require("../../utils/isEmpty");

// create a post
exports.createPost = async (req, res) => {
  try {
    if (isEmpty(req.body)) {
      res.status(400);
      res.send({ message: "body cannot be empty" });
      return;
    }

    const images = [];
    if (!isEmpty(req.files)) {
      req.files.postImages.forEach((file) => {
        images.push({
          _id: new ObjectId(),
          originalname: file.originalname,
          path: file.path,
          size: file.size,
        });
      });
    }

    const newPost = new Post({
      username: req.cookies.username,
      desc: req.body.desc,
      images: images,
    });

    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    console.log(err.message);
    return res.status(500).send(err.message);
  }
};

// get user posts
exports.getUserPosts = async (req, res) => {
  try {
    const userPosts = await (
      await Post.find({ username: req.params.username })
    ).reverse();
    if (userPosts) {
      res.status(200).json(userPosts);
    } else {
      res.status(404).json({ message: "no posts found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// get a post
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) throw new Error("post not found");
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// get timeline
exports.getTimeline = async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.cookies.username,
    });
    const userFollowings = user.followings;
    const timeline = await Post.find({
      username: { $in: userFollowings },
    }).sort({ createdAt: "desc" });

    res.status(200).json(timeline);
  } catch (err) {
    res.status(500).json(err);
  }
};

// delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      if (post.userId === req.body.userId) {
        post.images.map((img) => {
          fs.unlink(`./${img.path}`, (err) => {
            if (err) {
              console.log(err);
            }
          });
        });
        await post.deleteOne();
        res.status(200).json("the post has been deleted");
      } else {
        res.status(403).json("you can delete only your post");
      }
    } else {
      res.status(404).json("post not found");
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
};
