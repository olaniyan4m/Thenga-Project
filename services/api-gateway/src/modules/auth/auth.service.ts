import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthPayload, RegisterInput, LoginInput } from '@pezela/shared-types';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerInput: RegisterInput): Promise<AuthPayload> {
    // Check if user already exists (in real app, check database)
    const existingUser = await this.findUserByEmail(registerInput.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(registerInput.password, saltRounds);

    // Create user (in real app, save to database)
    const user = {
      id: this.generateId(),
      name: registerInput.name,
      phone: registerInput.phone,
      email: registerInput.email,
      role: 'merchant' as const,
      kycStatus: 'pending' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    };
  }

  async login(loginInput: LoginInput): Promise<AuthPayload> {
    // Find user (in real app, query database)
    const user = await this.findUserByEmail(loginInput.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password (in real app, compare with hashed password from database)
    const isPasswordValid = await this.verifyPassword(loginInput.password, user.hashedPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        kycStatus: user.kycStatus,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.findUserById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = this.jwtService.sign(
        { sub: user.id, email: user.email, role: user.role },
        {
          secret: this.configService.get('JWT_SECRET'),
          expiresIn: '15m',
        },
      );

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(userId: string) {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async findUserByEmail(email: string) {
    // Mock user data - in real app, query database
    const mockUsers = [
      {
        id: '1',
        name: 'Demo Merchant',
        phone: '+27821234567',
        email: 'demo@pezela.co.za',
        hashedPassword: await bcrypt.hash('password123', 12),
        role: 'merchant',
        kycStatus: 'verified',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return mockUsers.find(user => user.email === email);
  }

  private async findUserById(id: string) {
    // Mock user data - in real app, query database
    const mockUsers = [
      {
        id: '1',
        name: 'Demo Merchant',
        phone: '+27821234567',
        email: 'demo@pezela.co.za',
        hashedPassword: await bcrypt.hash('password123', 12),
        role: 'merchant',
        kycStatus: 'verified',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return mockUsers.find(user => user.id === id);
  }

  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
