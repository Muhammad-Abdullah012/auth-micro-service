import { User } from "@prisma/client";

export const removeExtraUserProperties = (
  user: User,
): Omit<
  User,
  | "passwordHash"
  | "passwordResetExpires"
  | "passwordResetToken"
  | "twoFactorSecret"
  | "deleted"
  | "refreshToken"
  | "verificationToken"
> => {
  const {
    passwordHash,
    passwordResetExpires,
    passwordResetToken,
    twoFactorSecret,
    deleted,
    refreshToken,
    verificationToken,
    ...rest
  } = user;
  return rest;
};
