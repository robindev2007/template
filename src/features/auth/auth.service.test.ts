import { AppError } from "@/core/utils/app-error";

import { AuthService } from "./auth.service";

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  password: "hashed-password",
  name: "Test",
  role: "user" as const,
  verified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockVerifiedUser = { ...mockUser, verified: true };
const mockSession = { id: "session-1", token: "raw-session-token", expiresAt: new Date() };
const mockTokenRecord = { id: "token-1", userId: "user-1", type: "magic_link" };
const mockJwt = "jwt-token-string";

jest.mock("@/core/config", () => ({
  config: {
    app: { name: "TestApp", frontendUrl: "http://localhost:3000" },
    auth: { tokenExpiryMinutes: 15, jwtExpiresIn: "7d" },
  },
}));

jest.mock("@/core/database", () => ({
  prisma: {
    user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  },
}));

jest.mock("@/core/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock("@/core/utils/jwt", () => ({
  JwtUtils: { sign: jest.fn().mockReturnValue("jwt-token-string"), verify: jest.fn() },
}));

jest.mock("@/services/email", () => ({
  emailQueue: { add: jest.fn().mockResolvedValue(undefined) },
}));

jest.mock("./session.service", () => ({
  SessionService: {
    create: jest
      .fn()
      .mockResolvedValue({ id: "session-1", token: "raw-session-token", expiresAt: new Date() }),
  },
}));

jest.mock("./verification-token.service", () => ({
  VerificationTokenService: {
    create: jest.fn().mockResolvedValue({ token: "raw-token", expiresAt: new Date() }),
    validate: jest.fn(),
  },
}));

const getPrisma = () => jest.requireMock("@/core/database").prisma;
const getEmailQueue = () => jest.requireMock("@/services/email").emailQueue;
const getJwtUtils = () => jest.requireMock("@/core/utils/jwt").JwtUtils;
const getSessionService = () => jest.requireMock("./session.service").SessionService;
const getVerificationTokenService = () =>
  jest.requireMock("./verification-token.service").VerificationTokenService;

beforeEach(() => {
  jest.clearAllMocks();
  (Bun as any).password = {
    hash: jest.fn().mockResolvedValue("hashed-password"),
    verify: jest.fn(),
  };
});

describe("AuthService.signup", () => {
  const payload = { email: "test@example.com", password: "secure123", name: "Test" };

  it("creates a new user and sends verification email", async () => {
    getPrisma().user.findUnique.mockResolvedValue(null);
    getPrisma().user.create.mockResolvedValue(mockUser);

    await AuthService.signup(payload);

    expect(getPrisma().user.create).toHaveBeenCalledWith({
      data: { email: payload.email, password: "hashed-password", name: "Test" },
    });
    expect(getVerificationTokenService().create).toHaveBeenCalledWith(
      mockUser.id,
      "magic_link",
      15,
    );
    expect(getEmailQueue().add).toHaveBeenCalledWith(
      "send-verify-email",
      expect.objectContaining({ to: mockUser.email }),
    );
  });

  it("throws error when email belongs to a verified user", async () => {
    getPrisma().user.findUnique.mockResolvedValue(mockVerifiedUser);

    await expect(AuthService.signup(payload)).rejects.toThrow(AppError);
    expect(getPrisma().user.create).not.toHaveBeenCalled();
    expect(getEmailQueue().add).not.toHaveBeenCalled();
  });

  it("resends verification email for unverified existing user", async () => {
    getPrisma().user.findUnique.mockResolvedValue(mockUser);

    await AuthService.signup(payload);

    expect(getVerificationTokenService().create).toHaveBeenCalledWith(
      mockUser.id,
      "magic_link",
      15,
    );
    expect(getEmailQueue().add).toHaveBeenCalled();
  });

  it("creates user without optional name", async () => {
    const noNamePayload = { email: "test@example.com", password: "secure123" };
    getPrisma().user.findUnique.mockResolvedValue(null);
    getPrisma().user.create.mockResolvedValue(mockUser);

    await AuthService.signup(noNamePayload);

    expect(getPrisma().user.create).toHaveBeenCalledWith({
      data: { email: noNamePayload.email, password: "hashed-password", name: null },
    });
  });
});

describe("AuthService.verifyEmail", () => {
  const payload = { email: "test@example.com", token: "valid-token" };

  it("verifies email with valid token and returns session + jwt", async () => {
    getPrisma().user.findUnique.mockResolvedValue(mockUser);
    getVerificationTokenService().validate.mockResolvedValue(mockTokenRecord);
    getSessionService().create.mockResolvedValue(mockSession);

    const result = await AuthService.verifyEmail(payload);

    expect(getPrisma().user.update).toHaveBeenCalledWith({
      where: { id: mockUser.id },
      data: { verified: true },
    });
    expect(getSessionService().create).toHaveBeenCalledWith(mockUser.id);
    expect(getJwtUtils().sign).toHaveBeenCalledWith({
      userId: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
      sessionId: mockSession.id,
    });
    expect(getEmailQueue().add).toHaveBeenCalledWith("send-welcome-email", expect.any(Object));
    expect(result).toEqual({
      token: mockJwt,
      session: { id: mockSession.id, token: mockSession.token, expiresAt: mockSession.expiresAt },
      user: { id: mockUser.id, email: mockUser.email, name: mockUser.name, role: mockUser.role },
    });
  });

  it("throws error for non-existent user", async () => {
    getPrisma().user.findUnique.mockResolvedValue(null);

    await expect(AuthService.verifyEmail(payload)).rejects.toThrow(AppError);
    expect(getPrisma().user.update).not.toHaveBeenCalled();
  });

  it("throws error for already verified user", async () => {
    getPrisma().user.findUnique.mockResolvedValue(mockVerifiedUser);

    await expect(AuthService.verifyEmail(payload)).rejects.toThrow(AppError);
    expect(getPrisma().user.update).not.toHaveBeenCalled();
  });

  it("throws error for invalid or expired token", async () => {
    getPrisma().user.findUnique.mockResolvedValue(mockUser);
    getVerificationTokenService().validate.mockResolvedValue(null);

    await expect(AuthService.verifyEmail(payload)).rejects.toThrow(AppError);
    expect(getPrisma().user.update).not.toHaveBeenCalled();
  });
});

describe("AuthService.login", () => {
  const payload = { email: "test@example.com", password: "correct-password" };

  it("returns token + session + user for valid verified credentials", async () => {
    getPrisma().user.findUnique.mockResolvedValue(mockVerifiedUser);
    (Bun as any).password.verify.mockResolvedValue(true);
    getSessionService().create.mockResolvedValue(mockSession);

    const result = await AuthService.login(payload);

    expect(getSessionService().create).toHaveBeenCalledWith(mockVerifiedUser.id);
    expect(getJwtUtils().sign).toHaveBeenCalledWith({
      userId: mockVerifiedUser.id,
      email: mockVerifiedUser.email,
      role: mockVerifiedUser.role,
      sessionId: mockSession.id,
    });
    expect(result).toEqual({
      token: mockJwt,
      session: { id: mockSession.id, token: mockSession.token, expiresAt: mockSession.expiresAt },
      user: {
        id: mockVerifiedUser.id,
        email: mockVerifiedUser.email,
        name: mockVerifiedUser.name,
        role: mockVerifiedUser.role,
      },
    });
  });

  it("throws error for non-existent user", async () => {
    getPrisma().user.findUnique.mockResolvedValue(null);

    await expect(AuthService.login(payload)).rejects.toThrow(AppError);
  });

  it("throws error for wrong password", async () => {
    getPrisma().user.findUnique.mockResolvedValue(mockVerifiedUser);
    (Bun as any).password.verify.mockResolvedValue(false);

    await expect(AuthService.login(payload)).rejects.toThrow(AppError);
  });

  it("sends new verification link for unverified user", async () => {
    getPrisma().user.findUnique.mockResolvedValue(mockUser);
    (Bun as any).password.verify.mockResolvedValue(true);

    const result = await AuthService.login(payload);

    expect(getVerificationTokenService().create).toHaveBeenCalledWith(
      mockUser.id,
      "magic_link",
      15,
    );
    expect(getEmailQueue().add).toHaveBeenCalledWith(
      "send-verify-email",
      expect.objectContaining({ to: mockUser.email }),
    );
    expect(result).toEqual({ redirectToSuccessPage: true });
  });
});
