const axios = require('axios'); // npm install axios

// ✅ Generate 6-digit OTP
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ✅ Send OTP via SMS using Fast2SMS
exports.sendOTPSMS = async (mobileNo, otp) => {
  try {
    const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
      params: {
        authorization: process.env.FAST2SMS_API_KEY,
        variables_values: otp,
        route: 'otp',
        numbers: mobileNo,
      },
    });

    if (response.data.return) {
      console.log(`✅ OTP SMS sent successfully to ${mobileNo}`);
      return { success: true };
    } else {
      throw new Error('SMS sending failed');
    }
  } catch (error) {
    console.error('❌ SMS Error:', error.message);
    throw new Error('Failed to send OTP SMS');
  }
};

// ✅ OTP Expiry (10 minutes)
exports.getOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};
