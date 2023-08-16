import { Test, TestingModule } from '@nestjs/testing';
import { PreviewController } from './preview.controller';

describe('PreviewController', () => {
  let controller: PreviewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreviewController],
    }).compile();

    controller = module.get<PreviewController>(PreviewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
