import type { NodeBaseProperties, NodeCredentialsType } from "@workspace/types";


export class GmailOAuth2Api implements NodeCredentialsType {
  name = "gmailOAuth2Api";
  displayName = "Gmail OAuth2 API";
  documentationUrl = "gmail";

  properties: NodeBaseProperties[] = [
    {
      displayName: "Grant Type",
      name: "grantType",
      type: "HIDDEN",
      default: "authorizationCode"
    },
    {
      displayName: "Client ID",
      name: "clientId",
      type: "STRING",
      default: "",
      description: "OAuth2 Client ID"
    },
    {
      displayName: "Client Secret",
      name: "clientSecret",
      type: "STRING",
      typeOptions: { password: true },
      default: "",
      description: "OAuth2 Client Secret"
    }
  ];
}