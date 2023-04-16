const express = require("express");
const bcrypt = require("bcryptjs");

const { User } = require("../models/user");
const auth = require("../middleware/auth");
const errorRespond = require("../helpers/errorRespond");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { fullname, email, password } = req.body;
  console.log(req.body);

  if (
    !String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
  )
    return errorRespond(res, 400, "Please enter a valid email.");

  if (!fullname) return errorRespond(res, 400, "Full name is required");
  else if (!email) return errorRespond(res, 400, "Email is required");
  else if (!password) return errorRespond(res, 400, "Password is required");

  if (email === "admin@wordtress.com")
    return errorRespond(res, 400, "Cannot use this email.");

  let user = await User.findOne({ email });

  const hashedPw = await bcrypt.hash(password, 12);

  if (!user) {
    user = new User({
      fullname,
      email,
      password: hashedPw,
      puzzleProgress: {
        timeRemaining: 300,
        level: 1,
        cluesUsed: 0,
        isCompleted: false,
        isStarted: false,
        wrongAttempts: 0,
      },
    });

    await user.save();
    const token = user.generateAuthToken(user._id?.toString());

    console.log(user);
    return res
      .header("x-auth-token", token)
      .send({ user, token, message: "Signed Up successfully" });
  } else if (user)
    return res.status(400).send({ message: "User already registered." });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  let isValidUser;

  if (
    !String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
  )
    return res.status(400).send({ message: "Please enter a valid email." });

  if (email === "admin@wordtress.com") {
    if (password === "wordTressAdmin") {
      return res.send({
        access: "admin_access",
        message: "verified_successfully",
      });
    } else return errorRespond(res, 400, "Wrong Password");
  }

  const user = await User.findOne({ email }, { __v: 0 });

  if (!user)
    return res
      .status(404)
      .send({ message: "User is not signed up. Please sign up." });
  else if (user) isValidUser = await bcrypt.compare(password, user.password);

  let sendUser = { ...user._doc };

  delete sendUser.password;

  if (isValidUser) {
    const token = user.generateAuthToken(user._id?.toString());
    res.header("x-auth-token", token).send({ user: sendUser, token });
  } else if (!isValidUser) return errorRespond(res, 400, "Wrong password");
});

router.get("/users", async (req, res) => {
  try {
    const adminPass = req.header("adminPass");
    // console.log(req.headers);
    if (adminPass === "wordTressAdmin") {
      let users = await User.find({}, { password: 0, __v: 0, email: 0 });
      console.log(users);
      return res.send(users);
    } else return errorRespond(res, 400, "Wrong Password");
  } catch (err) {
    console.log(err);
    res.status(400).send({ message: "Please login" });
  }
});

module.exports = router;
