import { Test, TestingModule } from '@nestjs/testing';
import { SigninService } from './signin.service';

describe('SigninService', () => {
  let service: SigninService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SigninService],
    }).compile();

    service = module.get<SigninService>(SigninService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
