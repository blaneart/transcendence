import { Test, TestingModule } from '@nestjs/testing';
import { StatusGateway } from './status.gateway';

describe('StatusGateway', () => {
  let gateway: StatusGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusGateway],
    }).compile();

    gateway = module.get<StatusGateway>(StatusGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
