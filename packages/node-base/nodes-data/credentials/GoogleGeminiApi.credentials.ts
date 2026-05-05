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

  // Not currently wired to a "Test Connection" button in the UI — no such
  // trigger exists yet. This implements real validation so the handler is
  // no longer dishonest (previously always returned OK), ready for when
  // one is added.
  test: async (data) => {
    const apiKey = data?.apiKey as string | undefined;
    const baseUrl = (data?.baseUrl as string | undefined) || "https://generativelanguage.googleapis.com";

    if (!apiKey) {
      return { status: "ERROR", message: "API key is required" };
    }

    try {
      const response = await fetch(`${baseUrl}/v1beta/models?key=${encodeURIComponent(apiKey)}`);

      if (response.ok) {
        return { status: "OK", message: "Connection successful" };
      }

      return { status: "ERROR", message: `Google Gemini rejected the key (HTTP ${response.status})` };
    } catch (error) {
      return {
        status: "ERROR",
        message: error instanceof Error ? error.message : "Failed to reach the Google Gemini API",
      };
    }
  }
}
