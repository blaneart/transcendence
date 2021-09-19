import { Test, TestingModule } from '@nestjs/testing';
import { DuelGateway } from './duel.gateway';

describe('DuelGateway', () => {
  let gateway: DuelGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DuelGateway],
    }).compile();

    gateway = module.get<DuelGateway>(DuelGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
