import { Test, TestingModule } from '@nestjs/testing';
import { FriendDuoService } from './friendDuo.service';

describe('FriendDuoService', () => {
  let service: FriendDuoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FriendDuoService],
    }).compile();

    service = module.get<FriendDuoService>(FriendDuoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
