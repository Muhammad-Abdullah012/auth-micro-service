import { Service } from "typedi";
import { openai } from "@/config/openai";
import { OPENAI_API_KEY } from "@/config";
import { ollama } from "@/config/ollama";

@Service()
export class ChatService {
  public async chat(prompt: string) {
    if(OPENAI_API_KEY) {
      return openai.chat.completions.create({ model: "gpt-3.5-turbo", messages: [{ role: "user", content: prompt }] });
    } else {
      const stream = await ollama.stream(prompt);
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      return { choices: [{ message: { content: chunks.join("") } }] }
    }
    return { choices: [{ message: { content: "Response " + prompt } }] };
  }
}
