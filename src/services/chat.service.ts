import { Service } from "typedi";
import { openai } from "@/config/openai";

@Service()
export class ChatService {
  public chat(prompt: string) {
    return openai.chat.completions.create({ model: "gpt-3.5-turbo", messages: [{ role: "user", content: prompt }] });
  }
}
