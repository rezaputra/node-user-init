export function generateVerificationEmailBody(otp: string): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Email Verification</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #333; text-align: center;">Dear User</h1>
        <p style="color: #555;">Welcome to the club</p>
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
