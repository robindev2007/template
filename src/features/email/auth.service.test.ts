import { describe, expect, test } from "bun:test";

import { AuthService } from "../auth/auth.service";

describe("AuthService - Login", () => {
  test("should call db.user.findUnique with correct parameters", async () => {
    const loginData = AuthService.login({
      email: "user@gmail.com",
      password: "password123",
    });

    expect(loginData).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      expiresIn: expect.any(Number),
      user: {
        id: expect.any(String),
        email: "user@gmail.com",
      },
    });
  });
});
