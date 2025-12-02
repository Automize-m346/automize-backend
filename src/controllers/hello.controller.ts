import { Controller, Get, UseGuards } from '@nestjs/common';
import { HelloService } from '../services/hello.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Hello')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('api/v1/hello')
export class HelloController {
  constructor(private readonly helloService: HelloService) {}

  @Get()
  @ApiOperation({ summary: 'Returns Hello World message' })
  getHello() {
    return this.helloService.getHello();
  }
}
