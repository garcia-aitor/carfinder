import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcryptjs";
import { UserRepository } from "../persistence/repositories/user.repository";
import { LoginResponse } from "./dto/login.response";
import { JwtPayload } from "./types/jwt-payload.type";

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string): Promise<LoginResponse> {
    const user = await this.userRepository.findByUsername(username);
    if (!user || !user.isActive) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const passwordMatches = await compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}
