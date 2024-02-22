import { Ollama } from "@langchain/community/llms/ollama";
import { LLM_MODEL, LLM_URL } from ".";

export const ollama = new Ollama({
  baseUrl: LLM_URL,
  model: LLM_MODEL,
});
