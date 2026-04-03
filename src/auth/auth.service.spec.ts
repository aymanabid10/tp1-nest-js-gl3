import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ValidateSignupHandler } from './handlers/signup/validate.handler';
import { CheckEmailHandler } from './handlers/signup/check-email.handler';
import { HashPasswordHandler } from './handlers/signup/hash-password.handler';
import { SaveUserHandler } from './handlers/signup/save-user.handler';
import { ValidateUserHandler } from './handlers/signin/validate-user.handler';
import { CheckPasswordHandler } from './handlers/signin/check-password.handler';
import { GenerateJwtHandler } from './handlers/signin/generate-jwt.handler';
import { SendEmailHandler } from './handlers/signin/send-email.handler';

const createHandlerMock = () => ({
  setNext: jest.fn().mockReturnThis(),
  handle: jest.fn(),
});

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ValidateSignupHandler, useValue: createHandlerMock() },
        { provide: CheckEmailHandler, useValue: createHandlerMock() },
        { provide: HashPasswordHandler, useValue: createHandlerMock() },
        { provide: SaveUserHandler, useValue: createHandlerMock() },
        { provide: ValidateUserHandler, useValue: createHandlerMock() },
        { provide: CheckPasswordHandler, useValue: createHandlerMock() },
        { provide: GenerateJwtHandler, useValue: createHandlerMock() },
        { provide: SendEmailHandler, useValue: createHandlerMock() },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
