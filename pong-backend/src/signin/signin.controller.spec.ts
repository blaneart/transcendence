import { Test, TestingModule } from '@nestjs/testing';
import { SigninController } from './signin.controller';

describe('SigninController', () => {
  let controller: SigninController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SigninController],
    }).compile();

    controller = module.get<SigninController>(SigninController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
