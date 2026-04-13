import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { LoginResponse } from "./dto/login.response";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { JwtPayload } from "./types/jwt-payload.type";

type AuthenticatedRequest = Request & {
  user: JwtPayload;
};

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(dto.username, dto.password);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@Req() req: AuthenticatedRequest): JwtPayload {
    return req.user;
  }
}
