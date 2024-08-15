import "dotenv/config";
const token = process.env["OPENAI_TOKEN"]!;
const endpoint = process.env["OPENAI_ENDPOINT"]!;
const deployment = process.env["OPENAI_DEPLOYMENT"]!;

import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { createTracingClient } from "@azure/core-tracing";

const tracingClient = createTracingClient({
  namespace: "Microsoft.OtelSample",
  packageName: "otel-sample",
  packageVersion: "1.0.0",
});

async function main(): Promise<void> {
  await tracingClient.withSpan("main", {}, async (updatedOptions) => {
    const client = ModelClient(endpoint, new AzureKeyCredential(token));

    const response = await client.path("/openai/deployments/gpt-40-mini/chat/completions" as any).post({
      body: {
        messages: [
          { role: "system", content: "You are a helpful assistant. You will talk like a pirate." }, // System role not supported for some models
          { role: "user", content: "Can you help me?" },
          { role: "assistant", content: "Arrrr! Of course, me hearty! What can I do for ye?" },
          { role: "user", content: "What's the best way to train a parrot?" },
        ],
        model: deployment,
        temperature: 1.,
        max_tokens: 1000,
        top_p: 1.
      },
      ...updatedOptions
    });
  
    if (isUnexpected(response)) {
      throw response.body.error;
    }
  
    console.log(response.body.choices[0].message.content);
  });

}

main().catch(err => {
  console.error("The sample encountered an error:", err);
});
