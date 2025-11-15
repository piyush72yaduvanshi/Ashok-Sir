import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};


export const otpExpiry = (minutes = 10) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

export const sendOTPSMS = async (mobileNo, otp) => {
  try {
    if (!process.env.FAST2SMS_API_KEY) {
      throw new Error("FAST2SMS_API_KEY is missing in .env");
    }

    const formattedNumber = mobileNo.startsWith("+91")
      ? mobileNo.replace("+91", "")
      : mobileNo;

    const message = `Your verification code is ${otp}. It will expire in 10 minutes. Do not share it with anyone.`;

    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        message: message,
        route: "v3",
        numbers: formattedNumber,
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ OTP sent successfully:", response.data);
    return { success: true, data: response.data };

  } catch (error) {
    console.error("❌ Fast2SMS Error:", error.response?.data || error.message);
    return { success: false, error: "SMS sending failed" };
  }
};
