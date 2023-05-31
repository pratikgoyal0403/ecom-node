const User = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "pratik.goyal0403@gmail.com",
    pass: "layog.kitarp",
  },
});

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let foundUser;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(400).json({ message: "No User Found" });
      }
      foundUser = user;
      return bcrypt.compare(password, foundUser.password);
    })
    .then((result) => {
      if (!result) {
        return res.status(400).json({ message: "Wrong Password" });
      }
      const token = jwt.sign(
        {
          email: foundUser.email,
          userId: foundUser._id.toString(),
          username: foundUser.username,
        },
        "companysecret",
        { expiresIn: "2hr" }
      );
      return res.status(200).json({ user: foundUser, token });
    })
    .catch((er) => console.log(er));
};

exports.signup = async (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const isAdmin = req.body.admin ? true : false;
  const salt = await bcrypt.genSalt(12);
  console.log(salt, password);
  bcrypt
    .hash(password, salt)
    .then((hashedPassword) => {
      const user = new User({
        username,
        email,
        password: hashedPassword,
        admin: isAdmin,
      });
      return user.save();
    })
    .then((savedUser) => {
      res.json({ savedUser });
    })
    .catch((err) => console.log(err));
};

exports.retryLoging = async (req, res, next) => {
  const { userId } = req.userInfo;
  const user = await User.findById(userId.toString());
  res.status(200).json({ user: user });
};

exports.requestPasswordReset = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      console.log("email not in db");
      return res.status(403).json({ message: "Email not found" });
    }
    const token = crypto.randomBytes(20).toString("hex");
    user.passwordResetToken = token;
    user.tokenExpiry = Date.now() + 600000;
    await user.save();
    let mailDetails = {
      from: "pratik.goyal0403@gmail.com",
      to: user.email,
      subject: "Reset password Request",
      text: `
          Click on the following link to reset your password 
          http://localhost:3000/verification/${token}
          This is only valid for 1 hour
        `,
    };
    transporter.sendMail(mailDetails, (err, data) => {
      if (err) {
        console.log(err);
        res.status(404).json({ message: "wrong" });
      } else {
        res.status(200).json({ message: "DONE" });
      }
    });
  } catch (err) {
    console.log(err);
  }
};

exports.verifyToken = async (req, res, next) => {
  const { token } = req.body;
  try {
    const isLegal = await User.findOne({
      passwordResetToken: token,
      tokenExpiry: { $gt: Date.now() },
    });
    if (!isLegal) {
      return res.status(404).json({ message: "Token expired" });
    }
    res.status(200).json({ message: "done", userId: isLegal._id });
  } catch (err) {
    console.log(err);
  }
};

exports.setNewPassword = async (req, res, next) => {
  const { password } = req.body;
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "done" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "password reset" });
  } catch (err) {
    console.log(err);
  }
};
