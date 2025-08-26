import prisma from "../config/database.js";

// Main Commission Calculation
export async function calculateCommission(userId, month, year) {
  // Get user info
  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
  if (!user) throw new Error("User not found");

  // Target for this month
  const target = await prisma.target.findFirst({
    where: { userId: Number(userId), month: Number(month), year: Number(year) }
  });
  const targetAmount = target ? target.target_amount : 0;

  // Get sales for this month
  const sales = await prisma.sale.findMany({
    where: {
      userId: Number(userId),
      createdAt: {
        gte: new Date(`${year}-${month}-01`),
        lt: new Date(`${year}-${Number(month) + 1}-01`)
      }
    }
  });

  let totalSales = sales.reduce((sum, s) => sum + s.amount, 0);

  // ----------------------
  //  COMMISSION RULES
  // ----------------------
  let commissionRate = 0.05; // base 5%

  // Tier bonuses
  if (totalSales > 25000) commissionRate += 0.04;
  else if (totalSales > 10000) commissionRate += 0.02;

  // Regional multiplier
  let multiplier = 1.0;
  switch (user.region) {
    case "north": multiplier = 1.1; break;
    case "south": multiplier = 0.95; break;
    case "east": multiplier = 1.0; break;
    case "west": multiplier = 1.05; break;
  }

  // Streak bonus
  let streakBonus = 0;
  if (target) {
    streakBonus = await calculateStreakBonus(userId, month, year);
    commissionRate += streakBonus;
  }

  // Performance penalty
  const penalty = await checkPenalty(userId, month, year);
  commissionRate += penalty;

  // Final commission
  const commission = totalSales * commissionRate * multiplier;

  return {
    userId: Number(userId),
    month: Number(month),
    year: Number(year),
    totalSales,
    targetAmount,
    commissionRate,
    multiplier,
    commission
  };
}

// --- Helpers ---
async function calculateStreakBonus(userId, month, year) {
  let streak = 0;
  let m = Number(month), y = Number(year);

  for (let i = 0; i < 5; i++) {
    if (m <= 0) { m = 12; y--; }

    const target = await prisma.target.findFirst({
      where: { userId, month: m, year: y }
    });
    if (!target) break;

    const sales = await prisma.sale.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(`${y}-${m}-01`),
          lt: new Date(`${y}-${m + 1}-01`)
        }
      }
    });

    const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);
    if (totalSales >= target.target_amount) streak++;
    else break;

    m--;
  }

  return Math.min(streak, 5) * 0.01; // +1% each, max 5%
}

async function checkPenalty(userId, month, year) {
  let prevMonth = Number(month) - 1;
  let prevYear = Number(year);
  if (prevMonth <= 0) { prevMonth = 12; prevYear--; }

  const target = await prisma.target.findFirst({
    where: { userId, month: prevMonth, year: prevYear }
  });
  if (!target) return 0;

  const sales = await prisma.sale.findMany({
    where: {
      userId,
      createdAt: {
        gte: new Date(`${prevYear}-${prevMonth}-01`),
        lt: new Date(`${prevYear}-${prevMonth + 1}-01`)
      }
    }
  });

  const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);
  return totalSales < target.target_amount * 0.5 ? -0.02 : 0;
}
