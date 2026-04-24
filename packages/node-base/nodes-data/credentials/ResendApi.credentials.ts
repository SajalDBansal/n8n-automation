import type { NodeBaseProperties, NodeCredentialsType } from "@workspace/types";


export const ResendApi: NodeCredentialsType = {
  name: "resendApi",
  displayName: "Resend API",
  documentationUrl: "resend",
  properties: [
    {
      displayName: "Resend Api Key",
      name: "resendApiKey",
      type: "STRING",
      typeOptions: { password: true },
      default: "",
      description:
        "API Key for Resend. You can find it in `https://resend.com/api-keys`",
    },
  ]
}
