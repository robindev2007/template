globalThis.Bun = {
  password: {
    hash: async () => "hashed-password",
    verify: async () => true,
  },
  version: "1.0.0",
} as any;
