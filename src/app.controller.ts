import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

@ApiTags('app')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Get API welcome message' })
  @ApiOkResponse({
    description: 'API welcome message.',
    schema: {
      example: {
        message: 'Task Manager NestJS API',
      },
    },
  })
  getHello() {
    return {
      message: 'Task Manager NestJS API'
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'Check API health' })
  @ApiOkResponse({
    description: 'API is running.',
    schema: {
      example: {
        status: 'ok',
        message: 'API is running',
      },
    },
  })
  health() {
    return {
      status: 'ok',
      message: 'API is running'
    }
  }
}
