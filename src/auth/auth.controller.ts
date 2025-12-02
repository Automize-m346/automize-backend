import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';

class RegisterDto {
  @ApiProperty({ example: 'john_doe', description: 'Username of the new user' })
  username!: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'Email of the new user',
  })
  email!: string;

  @ApiProperty({
    example: 'strongPassword123',
    description: 'Password of the new user',
  })
  password!: string;
}

class LoginDto {
  @ApiProperty({ example: 'john@example.com', description: 'User email' })
  email!: string;

  @ApiProperty({ example: 'strongPassword123', description: 'User password' })
  password!: string;
}

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body.username, body.email, body.password);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and get JWT token' })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get logged-in user info' })
  @ApiBearerAuth()
  async me(@Request() req: any) {
    return this.authService.getMe(req.user.userId);
  }
}
