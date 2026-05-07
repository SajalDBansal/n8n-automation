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
        // Callers are expected to have already validated from/to/subject/html
        // are present — no silent fallback to mock content or a hardcoded
        // recipient here. A falsy field reaching the Resend API is a real
        // configuration error and should fail loudly.
        const { data, error } = await this.resend.emails.send({
            from: from as string,
            to: to as string | string[],
            subject: subject as string,
            html: html as string,
        });

        if (error) {
            console.error("Resend send failed:", error.message);
            return { success: false, error: error.message }
        }

        return { success: true, data };
    }




}