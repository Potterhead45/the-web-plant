
import { OAuth2Client } from "google-auth-library";
import { User, IUser } from "../models/user.model.js";
import { RegisterInput, LoginInput } from "../validations/auth.validation.js";
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} from "../utils/errors.js";
import { signToken } from "../utils/token.js";
import { ENV } from "../config/env.js";

export class AuthService {
  private static getGoogleClient(): OAuth2Client {
    const clientId =
      process.env.GOOGLE_CLIENT_ID || ENV.GOOGLE_CLIENT_ID;

    const clientSecret =
      process.env.GOOGLE_CLIENT_SECRET || ENV.GOOGLE_CLIENT_SECRET;

    const callbackUrl =
      process.env.GOOGLE_CALLBACK_URL || ENV.GOOGLE_CALLBACK_URL;

    // Temporary diagnostic logging. Never log actual credentials.
    console.log("[Google OAuth diagnostic]", {
      cwd: process.cwd(),
      clientIdLoaded: Boolean(clientId),
      clientSecretLoaded: Boolean(clientSecret),
      envClientIdLoaded: Boolean(process.env.GOOGLE_CLIENT_ID),
      envClientSecretLoaded: Boolean(process.env.GOOGLE_CLIENT_SECRET),
      callbackUrlLoaded: Boolean(callbackUrl),
    });

    if (!clientId || !clientSecret) {
      throw new BadRequestError(
        "Google OAuth is not configured on this server. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env."
      );
    }

    return new OAuth2Client(
      clientId,
      clientSecret,
      callbackUrl
    );
  }

  static async register(
    input: RegisterInput
  ): Promise<{ user: IUser; token: string }> {
    const existing = await User.findOne({
      email: input.email.toLowerCase(),
    });

    if (existing) {
      throw new ConflictError(
        "An account with this email address already exists."
      );
    }

    const user = await User.create({
      name: input.name,
      email: input.email.toLowerCase(),
      password: input.password,
      authProvider: "local",
    });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
    });

    return { user, token };
  }

  static async login(
    input: LoginInput
  ): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({
      email: input.email.toLowerCase(),
    }).select("+password");

    if (!user) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    if (!user.password) {
      throw new UnauthorizedError(
        "This account was registered using Google Sign-In. Please click 'Continue with Google' to sign in."
      );
    }

    const isMatch = await user.comparePassword(input.password);

    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
    });

    return { user, token };
  }

  static async getUserById(userId: string): Promise<IUser> {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError("User account not found.");
    }

    return user;
  }

  /**
   * Generates Google OAuth 2.0 authorization URL.
   */
  static getGoogleAuthUrl(state: string): string {
    const client = this.getGoogleClient();

    return client.generateAuthUrl({
      access_type: "offline",
      scope: ["openid", "email", "profile"],
      state,
      prompt: "select_account",
    });
  }

  /**
   * Exchanges Google authorization code, verifies identity server-side,
   * creates/links user account, and returns authenticated user and JWT.
   */
  static async handleGoogleCallback(
    code: string,
    state: string,
    expectedState?: string
  ): Promise<{ user: IUser; token: string }> {
    // 1. Verify CSRF state.
    if (!state || !expectedState || state !== expectedState) {
      throw new BadRequestError(
        "Invalid or expired OAuth security state (CSRF check failed)."
      );
    }

    if (!code) {
      throw new BadRequestError(
        "Authorization code is missing from Google callback."
      );
    }

    const client = this.getGoogleClient();

    // 2. Exchange authorization code for tokens.
    let tokens;

    try {
      const response = await client.getToken(code);
      tokens = response.tokens;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);

      throw new BadRequestError(
        `Failed to exchange authorization code with Google: ${msg}`
      );
    }

    if (!tokens.id_token) {
      throw new BadRequestError("No ID token returned by Google.");
    }

    // 3. Verify Google ID token signature, issuer, audience, and expiration.
    let ticket;

    try {
      ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience:
          process.env.GOOGLE_CLIENT_ID || ENV.GOOGLE_CLIENT_ID,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);

      throw new UnauthorizedError(
        `Invalid Google ID token signature or expired token: ${msg}`
      );
    }

    const payload = ticket.getPayload();

    if (!payload) {
      throw new UnauthorizedError(
        "Google ID token payload could not be retrieved."
      );
    }

    const {
      sub: googleId,
      email,
      email_verified: emailVerified,
      name,
      picture,
    } = payload;

    if (!googleId || !email) {
      throw new BadRequestError(
        "Incomplete Google profile returned (missing ID or email)."
      );
    }

    if (!emailVerified) {
      throw new UnauthorizedError(
        "Your Google email is not verified by Google. Please verify it before signing in."
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 4. Find user by Google ID or email.
    let user = await User.findOne({ googleId });

    if (!user) {
      const existingByEmail = await User.findOne({
        email: normalizedEmail,
      });

      if (existingByEmail) {
        // Link Google ID to existing account.
        existingByEmail.googleId = googleId;

        if (!existingByEmail.avatar && picture) {
          existingByEmail.avatar = picture;
        }

        await existingByEmail.save();
        user = existingByEmail;
      } else {
        // Create a new account using Google identity.
        user = await User.create({
          name: name || normalizedEmail.split("@")[0],
          email: normalizedEmail,
          googleId,
          avatar: picture || "",
          authProvider: "google",
        });
      }
    } else {
      // Sync avatar if the existing account does not have one.
      if (!user.avatar && picture) {
        user.avatar = picture;
        await user.save();
      }
    }

    // 5. Issue application JWT.
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
    });

    return { user, token };
  }
}
