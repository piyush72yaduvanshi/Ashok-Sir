import twilio from "twilio";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);


export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};


export const otpExpiry = (minutes = 10) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};


export const sendOTPSMS = async (mobileNo, otp) => {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      throw new Error("Twilio credentials are missing in environment variables");
    }
        const formattedNumber = mobileNo.startsWith("+")
      ? mobileNo
      : `+91${mobileNo}`;

    const message = `Your verification code is ${otp}. It will expire in 10 minutes. Please do not share it with anyone.`;

    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber,
    });

    console.log(`✅ OTP sent successfully to ${mobileNo}: SID ${response.sid}`);
    return { success: true, sid: response.sid };
  } catch (error) {
    console.error("❌ Error sending OTP:", error.message);
    return { success: false, error: "SMS sending failed" };
  }
};

