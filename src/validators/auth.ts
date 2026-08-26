import * as z from "zod";
import { OTP_TYPES } from "../constants/auth";

export const nameSchema = z
  .string({ error: "Name must be a string" })
  .trim()
  .min(3, {
    message: "Name must be at least 3 characters long"
  })
  .max(50, {
    message: "Name must be at most 50 characters long"
  });

export const passwordSchema = z
  .string({ error: "Password must be a string" })
  .min(6, {
    message: "Password must be at least 6 characters long"
  })
  .max(80, {
    message: "Password must be at most 80 characters long"
  });

export const emailSchema = z
  .email({ message: "Please enter a valid email address." })
  .max(100, { message: "Email must be no more than 100 characters." });

export const roleSchema = z.enum(
  ["patient", "admin", "provider", "platform", "practitioner"],
  {
    error: "Role must be either patient, provider, practitioner or admin"
  }
);

export const SigninSchema = z.object({
  email: emailSchema,
  password: z.string({ error: "Password must be a string" }).min(1, {
    message: "Password is required"
  })
});

export const SignupSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema
  })
  .refine(
    data => {
      return data.password === data.confirmPassword;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"]
    }
  );

export const RequestOtpSchema = z.object({
  email: emailSchema,
  otpType: z.enum(OTP_TYPES, { error: "Invalid otp type" })
});

export const VerifyOtpSchema = z.object({
  otpCode: z.string().min(6, "Please enter a valid OTP"),
  email: emailSchema
});

export const ResetPasswordSchema = z.object({
  email: emailSchema,
  newPassword: passwordSchema
});

export const ChangePasswordSchema = z.object({
  oldPassword: z.string({ error: "Password must be a string" }).min(1, {
    message: "Old password is required"
  }),
  newPassword: passwordSchema
});

export const UpdateProfileSchema = z.object({
  name: nameSchema.optional(),
  avatar: z.string().optional()
});

export const GoogleSigninSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  provider: z.enum(["google", "github"]).default("google"),
  providerId: z.string({ error: "Provider id must be a string" }).min(1, {
    message: "Provider id is required"
  }),
  avatar: z.string().optional(),
  isEmailVerified: z.boolean().default(false)
});

export const DeleteAccountSchema = z.object({
  userId: z.string({ error: "User id must be a string" }).min(1, {
    message: "User id is required"
  }),
  type: z
    .enum(["soft", "hard"], { error: "Type must be either soft or hard" })
    .default("soft")
});

export const RegisterPatientSchema = z
  .object({
    name: nameSchema,
    dob: z.iso.date(),
    phone: z.string().min(1, "Phone number is required"),
    nin: z.string().length(11, "NIN must be exactly 11 characters"),
    email: emailSchema,
    password: passwordSchema,
    confirm_password: passwordSchema,
    gender: z.enum(["female", "male"]),
    address: z.string().optional()
  })
  .refine(data => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"]
  });

export const RegisterOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  cac_number: z.string().min(1, "CAC number is required"),
  email: emailSchema,
  password: passwordSchema
});

export const VerifySchema = z.object({
  actor_type: z.enum(["patient", "provider"]),
  actor_id: z.string().min(1, "Actor id is required"),
  code: z.string().min(1, "Verification code is required")
});

export const LoginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  actor_type: z.enum(["patient", "practitioner", "admin", "platform"])
});

export const RefreshSchema = z.object({
  refresh_token: z.string().min(1)
});

export const LogoutSchema = z.object({
  refresh_token: z.string().min(1)
});

export type RegisterPatientType = z.infer<typeof RegisterPatientSchema>;
export type RegisterOrganizationType = z.infer<
  typeof RegisterOrganizationSchema
>;
export type VerifyType = z.infer<typeof VerifySchema>;
export type LoginType = z.infer<typeof LoginSchema>;
export type RefreshType = z.infer<typeof RefreshSchema>;
export type LogoutType = z.infer<typeof LogoutSchema>;

export type SignupUserType = z.infer<typeof SignupSchema>;
export type SigninUserType = z.infer<typeof SigninSchema>;
export type RequestOtpType = z.infer<typeof RequestOtpSchema>;
export type VerifyOtpType = z.infer<typeof VerifyOtpSchema>;
export type ResetPasswordType = z.infer<typeof ResetPasswordSchema>;
export type ChangePasswordType = z.infer<typeof ChangePasswordSchema>;
export type UpdateProfileType = z.infer<typeof UpdateProfileSchema>;
export type GoogleSigninType = z.infer<typeof GoogleSigninSchema>;
export type DeleteAccountType = z.infer<typeof DeleteAccountSchema>;
