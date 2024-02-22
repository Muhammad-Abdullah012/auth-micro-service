import Mail from "nodemailer/lib/mailer";
import { SENDER_EMAIL } from "@/config";

export const secondsToHumanReadable = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0 && remainingSeconds > 0) {
    return `${minutes} minutes and ${remainingSeconds} seconds`;
  } else if (minutes > 0) {
    return `${minutes} minutes`;
  } else {
    return `${remainingSeconds} seconds`;
  }
};

export const getSendEmailPayload = ({
  to,
  subject,
  text,
}: Mail.Options): Mail.Options => {
  return {
    from: SENDER_EMAIL,
    to: `${SENDER_EMAIL.split("@")[0]}+me@gmail.com`, // Need to change this
    subject,
    text,
  };
};

export const stringifyIfPossible = (obj: any) => {
  try {
      return JSON.stringify(obj);
  } catch (error) {
      console.error('Unable to stringify the object:', error);
      return null;
  }
}
