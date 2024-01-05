import nodemailer, { SendMailOptions, SentMessageInfo } from "nodemailer";
import config from "../../config";

async function emailSender(email: string, title: string, body: string): Promise<any> {
    try {
        const transport = nodemailer.createTransport({
            host: config.email.host as string,
            port: config.email.port as number | undefined,
            auth: {
                user: config.email.user as string,
                pass: config.email.pass as string,
            },
        });

        const mailOptions: SendMailOptions = {
            from: "no_reply@mail.com",
            to: email,
            subject: title,
            html: body,
        };

        const info: SentMessageInfo = await transport.sendMail(mailOptions);

        return info;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error));
    }
}

export default emailSender;
