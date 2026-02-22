import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { RedirectService } from './common/redirect.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly redirectService: RedirectService,
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('redirect')
  async handleRedirect(@Query('url') url: string, @Res() res: Response) {
    const validatedUrl = this.redirectService.validateUrl(url);
    return res.redirect(validatedUrl);
  }
}
