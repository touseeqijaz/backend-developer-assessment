import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const sampleUsers = [
    { name: "Alice Johnson", email: "alice@company.com", region: "north", hire_date: "2024-01-15" },
    { name: "Bob Chen", email: "bob@company.com", region: "south", hire_date: "2024-03-01" }
  ];

  const createdUsers = await prisma.user.createMany({ data: sampleUsers });
  console.log("Users created:", createdUsers);

  const sampleTargets = [
    { userId: 1, month: 12, year: 2024, target_amount: 20000 },
    { userId: 2, month: 12, year: 2024, target_amount: 15000 }
  ];

  await prisma.target.createMany({ data: sampleTargets });
  console.log("Targets created!");
}

main().finally(() => prisma.$disconnect());
