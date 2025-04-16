import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";
import { UserModel } from "@/models/user.model";
import crypto from "crypto";

interface SendEmailParams {
  email: string;
  emailType: "VERIFY" | "RESET";
  userId: string;
  resetToken?: string;
}

interface MailResponse {
  messageId: string;
  // Add other properties you need from the response
}

export const sendEmail = async ({
  email,
  emailType,
  userId,
  resetToken,
}: SendEmailParams): Promise<MailResponse> => {
  try {
    // Validate required parameters
    if (!email || !userId) {
      throw new Error("Email and userId are required");
    }

    if (emailType === "RESET" && !resetToken) {
      throw new Error("Reset token is required for password reset emails");
    }

    let tokenToUse: string;
    let tokenToStore: string;

    if (emailType === "VERIFY") {
      const rawToken = crypto.randomBytes(32).toString("hex");
      tokenToUse = rawToken;
      tokenToStore = await bcryptjs.hash(rawToken, 10);

      await UserModel.findByIdAndUpdate(
        userId,
        {
          verifyToken: tokenToStore,
          verifyTokenExpiry: Date.now() + 86400000, // 24 hours
        },
        { new: true, runValidators: true }
      );
    } else {
      // TypeScript now knows emailType is "RESET" here
      tokenToUse = resetToken!; // We've already validated resetToken exists
      tokenToStore = await bcryptjs.hash(resetToken!, 10);

      await UserModel.findByIdAndUpdate(
        userId,
        {
          forgotPasswordToken: tokenToStore,
          forgotPasswordTokenExpiry: Date.now() + 3600000, // 1 hour
        },
        { new: true, runValidators: true }
      );
    }

    if (!process.env.AUTH_USER || !process.env.AUTH_PASS) {
      throw new Error("Mail transporter credentials not configured");
    }

    if (!process.env.DOMAIN) {
      throw new Error("Domain not configured");
    }

    const transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.AUTH_USER,
        pass: process.env.AUTH_PASS,
      },
    });

    const mailOptions = {
      from: "Text-RPG@NoReply.com",
      to: email,
      subject:
        emailType === "VERIFY" ? "Verify your email" : "Reset your password",
      html: `<p>Click <a href="${process.env.DOMAIN}${
        emailType === "VERIFY" ? "/verifyemail?token=" : "/reset-password/"
      }${tokenToUse}">here</a> to ${
        emailType === "VERIFY" ? "verify your email" : "reset your password"
      } or copy and paste the link below in your browser.<br><br>
      ${process.env.DOMAIN}${
        emailType === "VERIFY" ? "/verifyemail?token=" : "/reset-password/"
      }${tokenToUse}</p>`,
    };

    const mailResponse = await transport.sendMail(mailOptions);
    return mailResponse;
  } catch (error: unknown) {
    let errorMessage = "Failed to send email";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    console.error("Error sending email:", errorMessage);
    throw new Error(errorMessage);
  }
};
