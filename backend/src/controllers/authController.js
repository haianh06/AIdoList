const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const sendEmail = require('../utils/mailer');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) return res.status(400).json({ msg: "Email already exists" });

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) return res.status(400).json({ msg: "Username already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.create({
      data: {
        username,
        email,
        password_hash: hashedPassword
      }
    });

    return res.status(201).json({ msg: "User created successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      const accessToken = jwt.sign(
        { sub: user.id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      return res.status(200).json({
        msg: "Login success",
        access_token: accessToken,
        user: {
          id: user.id,
          username: user.username
        }
      });
    } else {
      return res.status(401).json({ msg: "Bad email or password" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(200).json({ msg: "If email exists, send email success" });
    }

    const resetToken = jwt.sign(
      { sub: user.id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '15m' }
    );

    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const mailBody = `Hi ${user.username},\n\nYou have requested to reset your password. Please click the link below (valid for 15 minutes):\n\n${resetLink}\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nAIdoList Team`;

    const sent = await sendEmail(email, "Reset Password AIdoList", mailBody);

    if (!sent) {
      return res.status(500).json({ msg: "Send email fail" });
    }

    return res.status(200).json({ msg: "Link reset password has been sent" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return res.status(400).json({ msg: "Invalid token" });
    }

    const userId = decoded.sub;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { password_hash: hashedPassword }
    });

    return res.status(200).json({ msg: "Your password has been reset!" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error" });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword
};