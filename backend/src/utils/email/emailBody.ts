import config from "../../config";

class GenerateEmail {
    static verificationEmail(otp: string) {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Email Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #333; text-align: center;">Verify email</h1>
            <p style="color: #555;">Dear user,</p>
            <p style="color: #555;">Your verification code is:</p>
            <p style="text-align: center; font-size: 24px; color: #007bff; margin-top: 10px;">
                <strong>${otp}</strong>
            </p>
            <p style="color: #555;">Please use this code to verify your email address.</p>
            <p style="color: #555;">If you didn't request this, please ignore this email.</p>
            <p style="color: #555;">Thanks, <br>For joining us </p>
            </div>
        </body>
        </html>
        `;
    }

    static forgotPasswordEmail(resetToken: string) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Forgot Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
                <h2 style="margin-bottom: 15px; text-align: center;">Reset password</h2>
                <p style="margin-bottom: 20px;">Dear User,</p>
                <p style="margin-bottom: 20px;">You have requested to recover your account. Please follow the link below to reset your email.</p>
                <div style="text-align: center;">
                    <a href="${config.url}${config.prefix}/auth/verify-reset-token/${resetToken}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Reset password</a>
                </div>
                <p style="margin-top: 20px;">If you did not request this, you can ignore this email.</p>
                <p>Best regards,<br>Your Company</p>
            </div>
        </body>
        </html>
        `;
    }
}

export default GenerateEmail;
