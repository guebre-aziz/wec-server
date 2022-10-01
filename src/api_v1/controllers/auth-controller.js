const User = require("../../api_v1/model/users-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const isEmpty = require("../../utils/isEmpty");

// register
exports.registerUser = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    let profilePicture = "",
      coverPicture = "";
    if (!isEmpty(req.files)) {
      profilePicture = req.files.profilePicture[0].path;
      coverPicture = req.files.coverPicture[0].path;
    }

    const newUser = await new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      profilePicture: profilePicture,
      coverPicture: coverPicture,
    });

    const user = await newUser.save();

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

    res
      .status(201)
      .json({ message: "user created successfully", user: user._id });
  } catch (err) {
    console.log(err.message);
    res.status(500).json(err.message);
  }
};

// login
exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(404).json({ message: "user not found" });
      return;
    }
    console.log(req.body.password);
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (validPassword) {
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
      const { password, ...userData } = user._doc;
      res
        .status(200)
        .json({ message: "Successfully logged in", user: userData });
    } else {
      res.status(400).json({ message: "wrong password" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
