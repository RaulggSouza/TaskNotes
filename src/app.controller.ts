import { Controller, Get } from '@nestjs/common'

@Controller()
export class AppController {
  @Get()
  getHello() {
    return {
      message: 'Task Manager NestJS API'
    }
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      message: 'API is running'
    }
  }
}