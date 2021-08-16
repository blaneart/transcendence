import { Test, TestingModule } from '@nestjs/testing';
import { PongController } from './pong.controller';

describe('PongController', () => {
  let controller: PongController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PongController],
    }).compile();

    controller = module.get<PongController>(PongController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
