import z from "zod";
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi
} from "@asteasolutions/zod-to-openapi";
import {
  ChangePasswordSchema,
  DeleteAccountSchema,
  RefreshSchema,
  RegisterOrganizationSchema,
  RegisterPatientSchema,
  RequestOtpSchema,
  ResetPasswordSchema,
  SigninSchema,
  SignupSchema,
  UpdateProfileSchema,
  VerifyOtpSchema
} from "../validators/auth";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

const ApiResponseSchema = registry.register(
  "ApiResponse",
  z.object({
    success: z.boolean(),
    message: z.string(),
    statusCode: z.number().int(),
    data: z.any().optional(),
    errors: z.any().optional()
  })
);

const HealthDataSchema = registry.register(
  "HealthData",
  z.object({
    status: z.string(),
    timestamp: z.string(),
    uptime: z.number()
  })
);

const DetailedHealthDataSchema = registry.register(
  "DetailedHealthData",
  HealthDataSchema.extend({
    environment: z.string(),
    version: z.string(),
    memory: z.object({
      used: z.number(),
      total: z.number(),
      unit: z.string()
    }),
    cpu: z.object({
      usage: z.record(z.string(), z.number())
    })
  })
);

const SignupRequestSchema = registry.register("SignupRequest", SignupSchema);
const RegisterPatientRequestSchema = registry.register(
  "RegisterPatientRequest",
  RegisterPatientSchema
);
const RegisterOrganizationRequestSchema = registry.register(
  "RegisterOrganizationRequest",
  RegisterOrganizationSchema
);
const VerifyRequestSchema = registry.register("VerifyRequest", VerifyOtpSchema);
const LoginRequestSchema = registry.register("LoginRequest", SigninSchema);
const UpdateProfileRequestSchema = registry.register(
  "UpdateProfileRequest",
  UpdateProfileSchema
);
const RefreshTokenRequestSchema = registry.register(
  "RefreshTokenRequest",
  RefreshSchema
);
const ForgotPasswordRequestSchema = registry.register(
  "ForgotPasswordRequest",
  RequestOtpSchema.pick({ email: true })
);
const VerifyResetOtpRequestSchema = registry.register(
  "VerifyResetOtpRequest",
  VerifyOtpSchema
);
const ResetPasswordRequestSchema = registry.register(
  "ResetPasswordRequest",
  ResetPasswordSchema
);
const ChangePasswordRequestSchema = registry.register(
  "ChangePasswordRequest",
  ChangePasswordSchema
);
const RequestDeleteAccountSchema = registry.register(
  "RequestDeleteAccountRequest",
  SigninSchema.pick({ password: true })
);
const DeleteAccountRequestSchema = registry.register(
  "DeleteAccountRequest",
  DeleteAccountSchema
);

registry.registerPath({
  method: "get",
  path: "/api/v1/health",
  tags: ["Health"],
  summary: "Basic health check",
  responses: {
    200: {
      description: "Service health status",
      content: {
        "application/json": {
          schema: ApiResponseSchema.extend({ data: HealthDataSchema })
        }
      }
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/api/v1/health/detailed",
  tags: ["Health"],
  summary: "Detailed health check",
  responses: {
    200: {
      description: "Detailed service health status",
      content: {
        "application/json": {
          schema: ApiResponseSchema.extend({ data: DetailedHealthDataSchema })
        }
      }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/signup",
  tags: ["Auth"],
  summary: "Register a user account",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: SignupRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: "Signup succeeded",
      content: {
        "application/json": {
          schema: ApiResponseSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/register/patient",
  tags: ["Auth"],
  summary: "Register a patient account",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: RegisterPatientRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: "Patient registration succeeded",
      content: {
        "application/json": {
          schema: ApiResponseSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/register/organization",
  tags: ["Auth"],
  summary: "Register an organization account",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: RegisterOrganizationRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: "Organization registration succeeded",
      content: {
        "application/json": {
          schema: ApiResponseSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/verify",
  tags: ["Auth"],
  summary: "Verify a user account with OTP",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: VerifyRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: "User verification succeeded",
      content: {
        "application/json": {
          schema: ApiResponseSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/login",
  tags: ["Auth"],
  summary: "Sign in a user",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: LoginRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: "Login succeeded",
      content: {
        "application/json": {
          schema: ApiResponseSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/api/v1/auth/profile",
  tags: ["Auth"],
  summary: "Fetch the currently signed-in user profile",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Profile fetched",
      content: {
        "application/json": {
          schema: ApiResponseSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: "patch",
  path: "/api/v1/auth/profile",
  tags: ["Auth"],
  summary: "Update the signed-in user profile",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: UpdateProfileRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: "Profile updated",
      content: {
        "application/json": {
          schema: ApiResponseSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/refresh",
  tags: ["Auth"],
  summary: "Refresh access and refresh tokens",
  request: {
    body: {
      required: false,
      content: {
        "application/json": {
          schema: RefreshTokenRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: "Tokens refreshed",
      content: {
        "application/json": {
          schema: ApiResponseSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/forgot-password",
  tags: ["Auth"],
  summary: "Request password reset OTP",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: ForgotPasswordRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: "OTP requested",
      content: {
        "application/json": {
          schema: ApiResponseSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/verify-reset-otp",
  tags: ["Auth"],
  summary: "Verify reset OTP",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: VerifyResetOtpRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: "Reset OTP verified",
      content: {
        "application/json": {
          schema: ApiResponseSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/reset-password",
  tags: ["Auth"],
  summary: "Reset password",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: ResetPasswordRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: "Password reset succeeded",
      content: {
        "application/json": {
          schema: ApiResponseSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/change-password",
  tags: ["Auth"],
  summary: "Change password",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: ChangePasswordRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: "Password changed",
      content: {
        "application/json": {
          schema: ApiResponseSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/account/request-delete",
  tags: ["Auth"],
  summary: "Request account deletion",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: RequestDeleteAccountSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: "Delete request accepted",
      content: {
        "application/json": {
          schema: ApiResponseSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: "delete",
  path: "/api/v1/auth/account/delete",
  tags: ["Auth"],
  summary: "Delete account",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: DeleteAccountRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: "Account deleted",
      content: {
        "application/json": {
          schema: ApiResponseSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: "delete",
  path: "/api/v1/auth/sessions/{sessionId}",
  tags: ["Auth"],
  summary: "Delete a specific session",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      sessionId: z.string().min(1)
    })
  },
  responses: {
    200: {
      description: "Session deleted",
      content: {
        "application/json": {
          schema: ApiResponseSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/auth/github",
  tags: ["OAuth"],
  summary: "Start GitHub OAuth flow",
  responses: {
    302: {
      description: "Redirect to GitHub"
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/auth/github/callback",
  tags: ["OAuth"],
  summary: "GitHub OAuth callback",
  responses: {
    200: {
      description: "OAuth callback handled"
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/auth/google",
  tags: ["OAuth"],
  summary: "Start Google OAuth flow",
  responses: {
    302: {
      description: "Redirect to Google"
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/auth/google/callback",
  tags: ["OAuth"],
  summary: "Google OAuth callback",
  responses: {
    200: {
      description: "OAuth callback handled"
    }
  }
});

const generator = new OpenApiGeneratorV3(registry.definitions);

export const swaggerDocument = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "Medidoc API",
    version: "1.0.0",
    description:
      "OpenAPI spec generated from Medidoc Zod validators and route registry."
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Local development"
    }
  ]
});
