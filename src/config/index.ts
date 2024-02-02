import { config } from "dotenv";
config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === "true";
export const {
  NODE_ENV,
  PORT,
  SECRET_KEY,
  LOG_FORMAT,
  LOG_DIR,
  ORIGIN,
  REFRESH_TOKEN_SECRET_KEY,
  VERIFICATION_TOKEN_SECRET_KEY,
  PASSWORD_RESET_TOKEN_SECRET_KEY,
  OPENAI_API_KEY,
  EMAIL_SERVICE,
  SENDER_EMAIL,
  SENDER_EMAIL_PASSWORD,
} = process.env;
