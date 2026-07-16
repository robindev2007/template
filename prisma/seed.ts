import "dotenv/config";

import bcrypt from "bcrypt";

import { config, prisma } from "@/core";

async function main() {
  const email = config.admin.email;
  const password = config.admin.password;

  const hashed = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashed,
      role: "ADMIN",
      verified: true,
    },
    create: {
      email,
      password: hashed,
      name: "Admin",
      role: "ADMIN",
      verified: true,
    },
  });

  console.log(`Admin seed complete: ${admin.email} (${admin.id})`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
