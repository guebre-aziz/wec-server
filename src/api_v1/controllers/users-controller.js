const User = require("../model/users-model");
const Posts = require("../model/posts-model");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const fs = require("fs");

// get a user
exports.getUser = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (user) {
      const { _id, password, ...other } = user._doc;
      res.status(200).json(other);
    } else {
      res.status(404).json({ message: "user not found" });
    }
  } catch (err) {
    return res.status(500).json(err.message);
  }
};

// get followers
exports.getNetwork = async (req, res) => {
  try {
    let followers = [];
    const userFollowers = await User.find({
      followings: { $in: [req.params.username] },
    });
    if (userFollowers?.length) {
      for (let i = 0; i < userFollowers.length; i++) {
        const { username, city, profilePicture } = userFollowers[i];
        followers.push({ username, city, profilePicture });
      }
    }

    let followings = [];
    const userFollowings = await User.find({
      followers: { $in: [req.params.username] },
    });
    if (userFollowings?.length) {
      for (let i = 0; i < userFollowings.length; i++) {
        const { username, city, profilePicture } = userFollowings[i];
        followings.push({ username, city, profilePicture });
      }
    }

    if (!followers.length && !followings.length) {
      res.status(204).json({});
    } else {
      res.status(200).json({ followers, followings });
    }
  } catch (err) {
    console.log(err.message);

    return res.status(500).json(err.message);
  }
};

// get followers
exports.getFollowings = async (req, res) => {
  try {
    const user = await User.find({ followers: req.params.username });
    if (user?.length) {
      const { _id, password, ...other } = user._doc;
      res.status(200).json(other);
    }
  } catch (err) {
    return res.status(500).json(err.message);
  }
};

// search users
exports.searchUsers = async (req, res) => {
  try {
    let searchKey = "";
    if (req.params.searchKey) {
      searchKey = req.params.searchKey;
    }

    const users = await User.find({
      username: { $regex: searchKey, $options: "i" },
    });
    if (users) {
      res.status(200).json(users);
    } else {
      res.status(204).json({ message: "no results" });
    }
  } catch (err) {}
};

// update user
exports.updateUser = async (req, res) => {
  try {
    const userOldData = await User.findById(req.cookies.userId);
    let profilePicturePath = userOldData.profilePicture;
    let coverPicturePath = userOldData.coverPicture;

    if (req.files.profilePicture) {
      fs.unlink(`./${profilePicturePath}`, (err) => {
        if (err) {
          console.log(err);
        }
      });
      profilePicturePath = req.files.profilePicture[0].path;
    }
    if (req.files.coverPicture) {
      fs.unlink(`./${coverPicturePath}`, (err) => {
        if (err) {
          console.log(err);
        }
      });
      coverPicturePath = req.files.coverPicture[0].path;
    }
    const user = await User.findByIdAndUpdate(
      req.cookies.userId,
      {
        email: req.body.email,
        desc: req.body.desc,
        city: req.body.city,
        profilePicture: profilePicturePath,
        coverPicture: coverPicturePath,
      },
      { returnOriginal: false }
    );

    if (user) {
      const maxAge = 3 * 60 * 60;
      const token = jwt.sign(
        { userId: user._id, username: user.username },
        jwtSecret,
        {
          expiresIn: maxAge, // 3hrs in sec
        }
      );
      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: maxAge * 1000, // 3hrs in ms
      });
      res.cookie("username", user.username, {
        httpOnly: false,
        maxAge: maxAge * 1000, // 3hrs in ms
      });
      res.cookie("userId", user._id, {
        httpOnly: false,
        maxAge: maxAge * 1000, // 3hrs in ms
      });

      res.status(200).json({ message: "account has been updated", user });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json(err.message);
  }
};

// follow/unfollow a user
exports.followUnfollowUser = async (req, res) => {
  try {
    if (req.cookies.username !== req.params.username) {
      const user = await User.findOne({ username: req.params.username });
      const currentUser = await User.findOne({
        username: req.cookies.username,
      });

      if (!user) {
        res.status(404).json({ message: "user not found" });
      }

      // unfollow
      if (user.followers.includes(req.cookies.username)) {
        await user.updateOne({ $pull: { followers: req.cookies.username } });
        await currentUser.updateOne({
          $pull: { followings: req.params.username },
        });
        res.status(200).json({ message: "unfollowed" });
      }

      // follow
      if (!user.followers.includes(req.cookies.username)) {
        await user.updateOne({ $push: { followers: req.cookies.username } });
        await currentUser.updateOne({
          $push: { followings: req.params.username },
        });
        res.status(200).json({ message: "following" });
      }
    } else {
      res.status(403).json({ message: "can not follow yourself" });
    }
  } catch (err) {
    console.log(err.message);
    return res.status(500).json(err.message);
  }
};

// delete user
exports.deleteAccount = async (req, res) => {
  try {
    // delete user data
    const user = await User.findOneAndDelete({
      username: req.cookies.username,
    });
    if (user) {
      // delete user images
      fs.unlink(`./${user.profilePicture}`, (err) => {
        if (err) {
          console.log(err);
        }
      });
      fs.unlink(`./${user.coverPicture}`, (err) => {
        if (err) {
          console.log(err);
        }
      });

      // delete posts
      const posts = await Posts.find({ userId: `${user._id}` });
      if (posts) {
        posts.map((post) => {
          post.images.map((img) => {
            fs.unlink(`./${img.path}`, (err) => {
              if (err) {
                console.log(err);
              }
            });
          });
        });
      }
      await Posts.deleteMany({ userId: `${user._id}` });

      res.status(200).json({ message: "account has benn deleted" });
    } else {
      res.status(404).json({ message: "error deletting account" });
    }
  } catch (err) {
    return res.status(500).json(err.message);
  }
};
