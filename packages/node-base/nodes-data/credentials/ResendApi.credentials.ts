import type { NodeBaseProperties, NodeCredentialsType } from "@workspace/types";


export class ResendApi implements NodeCredentialsType {
  name = "resendApi";

  displayName = "Resend API";

  documentationUrl = "resend";

  properties: NodeBaseProperties[] = [
    {
      displayName: "Resend Api Key",
      name: "resendApiKey",
      type: "STRING",
      typeOptions: { password: true },
      default: "",
      description:
        "API Key for Resend. You can find it in `https://resend.com/api-keys`",
    },
  ];
}
