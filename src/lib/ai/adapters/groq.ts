import { type ProviderAdapter, type GatewayRequest, type GatewayResult } from "../types";

export class GroqAdapter implements ProviderAdapter {
  async call(request: GatewayRequest): Promise<GatewayResult> {
    // Mock a crash (500 Internal Server Error)
    return {
      ok: false,
      error: {
        code: "api_error",
        message: "Internal Server Error from Groq",
        model: request.model.id,
        statusCode: 500,
      }
    };
  }

  async isConfigured(): Promise<boolean> {
    return true;
  }
}
