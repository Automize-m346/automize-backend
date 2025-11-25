import { Controller, Get } from '@nestjs/common';
import { HelloService } from '../services/hello.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Hello')
@Controller('api/v1/hello')
export class HelloController {
  constructor(private readonly helloService: HelloService) {}

  @Get()
  @ApiOperation({ summary: 'Returns Hello World message' })
  getHello() {
    return this.helloService.getHello();
  }
}
