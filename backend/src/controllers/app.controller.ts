import { Controller, Get, Inject } from '@nestjs/common';
import { IMessageDto, MessageDto } from '../dtos/message.dto';
import { AppService } from '../services/app/app.service';
import { Mapper } from '../utils/mapper/mapper';
import { Public } from '../modules/auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(@Inject(AppService) private readonly appService: AppService) {}

  @Get('hello')
  @Public()
  getHello(): IMessageDto {
    const entity = this.appService.getHello();

    const dto = Mapper.mapData(MessageDto, entity);
    return dto;
  }

  @Get('health')
  @Public()
  getHealth(): { status: string; timestamp: string; service: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'bonusx-file-uploader',
    };
  }
}
