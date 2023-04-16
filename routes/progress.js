const express = require("express");

const { User } = require("../models/user");
const auth = require("../middleware/auth");

const router = express.Router();

router.put("/update", auth, async (req, res) => {
  const { puzzleProgress } = req.body;

  const user = await User.updateOne(
    { email: req.user.email },
    { puzzleProgress }
  );

  return res.send({
    progress: user.puzzleProgress,
    message: "progress_updated",
  });
});

module.exports = router;
