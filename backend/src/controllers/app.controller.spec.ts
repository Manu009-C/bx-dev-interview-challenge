import { Mocked, TestBed } from '@suites/unit';
import { MessageDto } from '../dtos/message.dto';
import { MessageEntity } from '../entities/message.entity';
import { AppService } from '../services/app/app.service';
import { IAppService } from '../services/app/app.service.interface';
import { Mapper } from '../utils/mapper/mapper';
import { AppController } from './app.controller';

jest.mock('../utils/mapper/mapper');

describe('AppController', () => {
  let appController: AppController;
  let appService: Mocked<IAppService>;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(AppController).compile();

    appController = unit;
    appService = unitRef.get(AppService);

    jest.spyOn(Mapper, 'mapData').mockImplementation();
  });

  describe('getHello', () => {
    it('should call the service', () => {
      appController.getHello();

      expect(appService.getHello).toHaveBeenCalledWith();
    });

    it('should call the mapper with the result from the service', () => {
      const message = 'Hello World!';
      const resultFromService = new MessageEntity(message);
      appService.getHello.mockReturnValue(resultFromService);

      appController.getHello();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(Mapper.mapData).toHaveBeenCalledWith(
        MessageDto,
        resultFromService,
      );
    });

    it('should return the value from the mapper', () => {
      const resultFromService = new MessageEntity('any message');
      const expectedResult = new MessageDto('any dto');

      appService.getHello.mockReturnValue(resultFromService);
      jest.spyOn(Mapper, 'mapData').mockReturnValue(expectedResult);

      const result = appController.getHello();

      expect(result).toBe(expectedResult);
    });
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = appController.getHealth();

      expect(result).toEqual({
        status: 'ok',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        timestamp: expect.any(String),
        service: 'bonusx-file-uploader',
      });
    });

    it('should return valid timestamp', () => {
      const before = new Date();
      const result = appController.getHealth();
      const after = new Date();

      const timestamp = new Date(result.timestamp);
      expect(timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });
});
