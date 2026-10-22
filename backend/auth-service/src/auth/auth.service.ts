import {
  ConflictException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import type { LoginDto } from "./dto/login.dto.js";
import type { RegisterDto } from "./dto/register.dto.js";
import type { User } from "../generated/prisma/client.js";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class AuthService {
  private readonly google = new OAuth2Client();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register({ name, email, password }: RegisterDto) {
    email = email.toLowerCase();
    if (await this.prisma.user.findUnique({ where: { email } })) {
      throw new ConflictException("Email already registered");
    }
    const user = await this.prisma.user.create({
      data: { name, email, passwordHash: await bcrypt.hash(password, 12) },
    });
    return this.session(user);
  }

  async login({ email, password }: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid email or password");
    }
    return this.session(user);
  }

  async googleLogin(idToken: string) {
    const audience = process.env.GOOGLE_CLIENT_ID;
    if (!audience) throw new ServiceUnavailableException("Google sign-in is not configured");

    let payload;
    try {
      const ticket = await this.google.verifyIdToken({ idToken, audience });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException("Invalid Google token");
    }
    if (!payload?.sub || !payload.email || !payload.email_verified) {
      throw new UnauthorizedException("Google account email not verified");
    }

    const email = payload.email.toLowerCase();
    const existing =
      (await this.prisma.user.findUnique({ where: { googleId: payload.sub } })) ??
      (await this.prisma.user.findUnique({ where: { email } }));
    const user = existing
      ? existing.googleId
        ? existing
        : await this.prisma.user.update({ where: { id: existing.id }, data: { googleId: payload.sub } })
      : await this.prisma.user.create({
          data: { email, name: payload.name ?? email, googleId: payload.sub },
        });
    return this.session(user);
  }

  private async session(user: User) {
    const accessToken = await this.jwt.signAsync({ sub: user.id, email: user.email });
    return { accessToken, user: { id: user.id, email: user.email, name: user.name } };
  }
}
