const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

exports.adminAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Not authorized" });
      }
      if (
        decodedToken.userId !== req.cookies.userId ||
        decodedToken.username !== req.cookies.username
      ) {
        return res.status(401).json({ message: "user not authorized" });
      } else {
        next();
      }
    });
  } else {
    return res
      .status(401)
      .json({ message: "Not authorized, token not available" });
  }
};
