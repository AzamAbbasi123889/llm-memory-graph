import axios from "axios";
import env from "../config/env.js";
import { AppError } from "../utils/errors.js";

const groqClient = axios.create({
  baseURL: "https://api.groq.com/openai/v1",
  timeout: 20000,
  headers: {
    Authorization: `Bearer ${env.groqApiKey}`,
    "Content-Type": "application/json"
  }
});

export async function generateAnswer({ question, memorySnippets = [] }) {
  if (!env.groqApiKey) {
    throw new AppError("The LLM is not configured yet. Add GROQ_API_KEY to continue.", 503);
  }

  const contextBlock = memorySnippets.length
    ? memorySnippets
        .map(
          (item, index) =>
            `${index + 1}. Previous question: ${item.question}\nPrevious answer: ${item.answer}`
        )
        .join("\n\n")
    : "No prior memory snippets were relevant.";

  let response;

  try {
    response = await groqClient.post("/chat/completions", {
      model: env.groqModel,
      temperature: 0.35,
      max_completion_tokens: 900,
      messages: [
        {
          role: "system",
          content:
            "You are NeuroGraph AI, a concise but insightful assistant. Answer with helpful markdown, use short sections when useful, and prefer clarity over verbosity."
        },
        {
          role: "system",
          content: `Relevant memory:\n${contextBlock}`
        },
        {
          role: "user",
          content: question
        }
      ]
    });
  } catch (error) {
    throw new AppError(
      error?.response?.data?.error?.message || "The LLM provider is unavailable right now.",
      503
    );
  }

  return {
    answer: response.data?.choices?.[0]?.message?.content?.trim() || "I couldn't generate an answer.",
    tokensUsed: response.data?.usage?.total_tokens || 0
  };
}
