import { z } from "zod";

export const CreateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email(),
  username: z.string().min(2).optional(),
  password: z.string().min(8, "Password must be atleast 8 characters").optional(),
  college: z.string().min(1).max(100).optional().nullable(),
  major: z.string().min(1).max(100).optional().nullable(),
  bio: z.string().min(1).max(500).optional().nullable(),
  
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
