import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './friendDuo.controller';

describe('FriendDuoController', () => {
  let controller: FriendDuoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendDuoController],
    }).compile();

    controller = module.get<FriendDuoController>(FriendDuoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
