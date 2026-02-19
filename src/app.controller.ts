import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { I18nLang } from 'nestjs-i18n';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('i18n-debug')
  getLocale(@I18nLang() lang: string) {
    return { locale: lang };
  }
}
