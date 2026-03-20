import { Resend } from "resend";

interface EmailParams {
    from?: string;
    to?: string | string[];
    subject?: string;
    html?: string
}

export class ResendEmailService {
    private resend: Resend;
    constructor(private apiKey: string) {
        if (!apiKey) {
            throw new Error("API Key not found");
        }
        this.resend = new Resend(apiKey);
    }

    sendEmail = async ({ from, to, subject, html }: EmailParams)
        : Promise<{ success: boolean; data?: any; error?: string }> => {
        console.log("Sending Email");
        const { data, error } = await this.resend.emails.send({
            from: from || "Acme <onboarding@resend.dev>",
            to: to || ["sajaldutt.bansal@gmail.com"],
            subject: subject || "Hello world",
            html: html || "<strong>This is a sample email</strong>",
        });
        console.log("Email send attemp finished");
        console.log("Response data: ", { data, error });

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true, data };
    }




}