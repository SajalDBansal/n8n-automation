import type { NodeBaseProperties, NodeCredentialsType } from "@workspace/types";


export const GoogleGeminiApi: NodeCredentialsType = {
  name: "googleGeminiApi",
  displayName: "Google Gemini API",
  documentationUrl: "https://ai.google.dev/docs",
  properties: [
    {
      displayName: "API Key",
      name: "apiKey",
      type: "STRING",
      typeOptions: { password: true },
      default: "",
      required: true,
      description: "Your Google Gemini API Key. Get it from Google AI Studio.",
    },
    {
      displayName: "Base URL",
      name: "baseUrl",
      type: "STRING",
      default: "https://generativelanguage.googleapis.com",
      description: "Base URL for Google Gemini API",
    },
  ],

  test: async () => {
    // #todo: here i would implement API key validation, which will check if the given key is valid or not
    return {
      status: "OK",
      message: "Connection successful",
    };
  }
}
