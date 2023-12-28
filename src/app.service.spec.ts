import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should add two numbers', () => {
    expect(service.add(1, 2)).toBe(3);
  });

  it('should add two decimals', () => {
    expect(service.add(0.1, 0.2)).toBeCloseTo(0.3);
  });
});
