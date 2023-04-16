const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    minlength: 2,
    maxlength: 50,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  puzzleProgress: {
    timeRemaining: Number,
    level: Number,
    cluesUsed: Number,
    isCompleted: {
      type: Boolean,
      default: false,
    },
    isStarted: {
      type: Boolean,
      default: false,
    },
    wrongAttempts: Number,
    result: String,
  },
});

userSchema.methods.generateAuthToken = function (userId) {
  const token = jwt.sign(
    {
      _id: userId,
      fullname: this.fullname,
      email: this.email,
    },
    process.env.JWT_PRIVATE_KEY
  );
  return token;
};

const User = mongoose.model("User", userSchema);

module.exports.userSchema = userSchema;
module.exports.User = User;
