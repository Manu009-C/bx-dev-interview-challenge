import { Controller, Get, Post, Inject } from '@nestjs/common';
import { IMessageDto, MessageDto } from '../dtos/message.dto';
import { AppService } from '../services/app/app.service';
import { UserService } from '../services/user.service';
import { Mapper } from '../utils/mapper/mapper';
import { Public } from '../modules/auth/decorators/public.decorator';
import { CurrentUser } from '../modules/auth/decorators/current-user.decorator';
import { ClerkUser } from '../modules/auth/strategies/clerk.strategy';

@Controller()
export class AppController {
  constructor(
    @Inject(AppService) private readonly appService: AppService,
    private readonly userService: UserService,
  ) {}

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

  @Post('sync-user')
  async syncUser(@CurrentUser() user: ClerkUser): Promise<{ message: string }> {
    await this.userService.findOrCreateUser(user);
    return { message: 'User synced successfully' };
  }
}
