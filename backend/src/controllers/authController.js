const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db_prisma');
const sendEmail = require('../utils/mailer');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body; // Get username, email, and password from request body

    if (!username || !email || !password) { // Check for missing fields
      return res.status(400).json({ msg: "Missing fields" });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) return res.status(400).json({ msg: "Email already exists" }); // Check for existing email

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) return res.status(400).json({ msg: "Username already exists" }); //Check for existing username

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt); // Hash Pasword before save to DB

    await prisma.user.create({
      data: {
        username,
        email,
        password_hash: hashedPassword
      }
    }); // Using Pisma to save to DB

    return res.status(201).json({ msg: "User created successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body; // Get email, pasword from user request 

    const user = await prisma.user.findUnique({ where: { email } }); // Find user by email

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      const accessToken = jwt.sign(
        { sub: user.id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      ); // Check if email existed and password is correct, then generate JWT token

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
    const { email } = req.body; // Get email from user request
    const user = await prisma.user.findUnique({ where: { email } }); // Find user by email

    if (!user) {
      return res.status(200).json({ msg: "If email exists, send email success" });
    } // Always return success message to prevent email enumeration

    const resetToken = jwt.sign(
      { sub: user.id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '15m' }
    ); // Generate reset token valid for 15 minutes 

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
    const { token, new_password } = req.body; // Get token and new password from user request

    if (!token || !new_password) {
      return res.status(400).json({ msg: "Missing fields" });
    } // Check for missing fields

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Verify token
    } catch (err) {
      return res.status(400).json({ msg: "Invalid token" });
    }

    const userId = decoded.sub; // Get user ID from token
    const user = await prisma.user.findUnique({ where: { id: userId } }); // Find user by ID

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt); // Hash new password

    await prisma.user.update({
      where: { id: userId },
      data: { password_hash: hashedPassword }
    }); // Update user's password in DB

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