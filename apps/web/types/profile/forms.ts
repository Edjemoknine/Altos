import type { z } from "zod";
import type {
  avatarFileSchema,
  passwordChangeSchema,
  profileSchema,
} from "@/schemas/profile";

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;
export type AvatarFile = z.infer<typeof avatarFileSchema>;
