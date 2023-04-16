const jwt = require("jsonwebtoken");

const { User } = require("../models/user");

module.exports = async function (req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) return res.status(401).send("Access denied. No token provided.");

  jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, user) => {
    try {
      if (user) {
        const email = user.email;
        const userData = await User.findOne({ email });
        if (userData) {
          req.user = userData;
        } else {
          const err = new Error("Please signup");
          err.statusCode = 400;
          throw err;
        }

        next();
      } else if (err.message === "jwt expired")
        return res.status(403).json({ message: "Access token expired" });
      else return res.status(402).json({ message: "User not authenticated" });
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  });
};
