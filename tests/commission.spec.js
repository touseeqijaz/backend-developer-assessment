import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/config/database.js";

describe("Commission - Scenario A (Alice mid-month transfer)", () => {
  test("Alice Dec 2024 commission matches example", async () => {
    const res = await request(app).get("/api/commission/1/12/2024");
    expect(res.status).toBe(200);
    const body = res.body;
    // base parts + tier should be approx 668.34 per example
    expect(body.total).toBeCloseTo(668.34, 2);
    expect(body.hit_target).toBe(false);
  });
});
