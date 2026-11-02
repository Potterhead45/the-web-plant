import { User, IUser } from "../models/user.model.js";
import { RegisterInput, LoginInput } from "../validations/auth.validation.js";
import { ConflictError, UnauthorizedError, NotFoundError } from "../utils/errors.js";
import { signToken } from "../utils/token.js";

export class AuthService {
  static async register(input: RegisterInput): Promise<{ user: IUser; token: string }> {
    const existing = await User.findOne({ email: input.email.toLowerCase() });
    if (existing) {
      throw new ConflictError("An account with this email address already exists.");
    }

    const user = await User.create({
      name: input.name,
      email: input.email.toLowerCase(),
      password: input.password,
    });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
    });

    return { user, token };
  }

  static async login(input: LoginInput): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email: input.email.toLowerCase() }).select("+password");
    if (!user) {
      throw new UnauthorizedError("Invalid email or password.");
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
}
