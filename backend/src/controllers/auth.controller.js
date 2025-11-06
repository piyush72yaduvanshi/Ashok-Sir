const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateToken } = require('../utils/jwt.utils');
const { generateOTP, sendOTPSMS, getOTPExpiry } = require('../utils/otp.utils');

// Generate random password for franchise users
const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, mobileNo, role } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { mobileNo }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or mobile number',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      mobileNo,
      role: role || 'FRANCHISE_ADMIN',
      isActive: role === 'SUPER_ADMIN' ? true : false, // Super admin active by default
      isVerified: role === 'SUPER_ADMIN' ? true : false,
    });

    const token = generateToken({ userId: user._id, email: user.email, role: user.role });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('franchiseId');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact administrator.',
      });
    }

    // For franchise users, check if they need OTP verification
    if (user.role === 'FRANCHISE_ADMIN' && !user.isVerified) {
      return res.status(200).json({
        success: true,
        message: 'Please verify your mobile number with OTP',
        requiresOTP: true,
        mobileNo: user.mobileNo,
      });
    }

    const token = generateToken({ userId: user._id, email: user.email, role: user.role });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        franchiseId: user.franchiseId,
        franchise: user.franchiseId,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.logout = (_req, res) => {
  res.clearCookie('token');
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

exports.generateOTP = async (req, res) => {
  try {
    const { mobileNo } = req.body;

    const user = await User.findOne({ mobileNo });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this mobile number',
      });
    }

    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    await User.findByIdAndUpdate(user._id, {
      otp,
      otpExpiry,
    });

    await sendOTPSMS(mobileNo, otp);

    res.json({
      success: true,
      message: 'OTP sent successfully to your mobile number',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { mobileNo, otp } = req.body;

    const user = await User.findOne({ mobileNo }).populate('franchiseId');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new one.',
      });
    }

    await User.findByIdAndUpdate(user._id, {
      isVerified: true,
      isActive: true,
      otp: null,
      otpExpiry: null,
    });

    const token = generateToken({ userId: user._id, email: user.email, role: user.role });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'OTP verified successfully. Account activated.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        franchiseId: user.franchiseId,
        franchise: user.franchiseId,
        isVerified: true,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Super Admin: Create franchise user with credentials
exports.createFranchiseUser = async (req, res) => {
  try {
    const { name, email, mobileNo, franchiseId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { mobileNo }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or mobile number',
      });
    }

    // Generate random password
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      mobileNo,
      role: 'FRANCHISE_ADMIN',
      franchiseId,
      isActive: false, // Will be activated after OTP verification
      isVerified: false,
    });

    res.status(201).json({
      success: true,
      message: 'Franchise user created successfully',
      credentials: {
        email: user.email,
        password: password, // Send this to franchise owner
        mobileNo: user.mobileNo,
      },
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        franchiseId: user.franchiseId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('franchiseId')
      .select('-password -otp -refreshToken');

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};