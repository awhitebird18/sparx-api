import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/is-public';

@Controller()
export class AppController {
  @Public()
  @Get('health-check')
  checkHealth(): { status: string } {
    return { status: 'ok' };
  }
}
