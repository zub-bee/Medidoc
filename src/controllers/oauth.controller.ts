import { NextFunction, Request, Response } from "express";
import { Profile as GithubProfile } from "passport-github2";
import { Profile as GoogleProfile } from "passport-google-oauth20";

import { ApiResponse } from "../utils/api-response";
import { AsyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import { OAuthService } from "../services/oauth.service";
import { setAuthCookies } from "../helpers/cookie.helper";

type GithubRawEmail = { value: string; primary: boolean; verified: boolean };

//? LOGIN WITH GITHUB
export const githubOAuth = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = req.user as GithubProfile | undefined;

    if (!data) {
      return next(ApiError.unauthorized("Authenticated failed!"));
    }

    const emails = (data.emails as unknown as GithubRawEmail[]) || [];
    const primaryEmail = emails.find(email => email.primary) || emails[0];

    const user = {
      provider: data?.provider as "local" | "google" | "github",
      providerId: data.id,
      name: data.displayName,
      email: primaryEmail?.value,
      isEmailVerified: primaryEmail?.verified === true,
      avatar: data.photos && data.photos[0].value,
      ip: req.ip || "Unknown",
      userAgent: req.get("user-agent") || req.headers["user-agent"] || "Unknown"
    };

    const existingUser = await OAuthService.handleOAuthLogin(user, {
      setAuthCookie: (
        accessToken: string,
        refreshToken: string,
        sessionId: string
      ) => {
        setAuthCookies(res, accessToken, refreshToken, sessionId);
      }
    });

    //? save the data into your databases

    ApiResponse.ok(res, "Signin Successfull", {
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        avatar: existingUser.avatar,
        isEmailVerified: existingUser.isEmailVerified,
        lastLoginAt: existingUser.lastLoginAt,
        provider: existingUser.provider
      }
    });
  }
);

//? LOGIN WITH GOOGLE
export const googleOAuth = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = req.user as GoogleProfile | undefined;

    if (!data) {
      return next(ApiError.unauthorized("Authenticated failed!"));
    }

    const userInfo = {
      provider: data?.provider as "local" | "google" | "github",
      providerId: data.id,
      name: data.displayName,
      email: data?.emails && data?.emails[0]?.value,
      isEmailVerified: data?.emails?.[0]?.verified === true,
      avatar: data.profileUrl || (data.photos && data.photos[0].value),
      ip: req.ip || "Unknown",
      userAgent: req.get("user-agent") || req.headers["user-agent"] || "Unknown"
    };

    const existingUser = await OAuthService.handleOAuthLogin(userInfo, {
      setAuthCookie: (
        accessToken: string,
        refreshToken: string,
        sessionId: string
      ) => {
        setAuthCookies(res, accessToken, refreshToken, sessionId);
      }
    });

    // TODO: role must be gotten before sign in is successful

    ApiResponse.ok(res, "Signin Successfull", {
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        avatar: existingUser.avatar,
        isEmailVerified: existingUser.isEmailVerified,
        lastLoginAt: existingUser.lastLoginAt,
        provider: existingUser.provider
      }
    });
  }
);
