import request from "supertest";
import app from "../src/app.js";

describe("Streak bonus behavior", () => {
  test("Bob December should have 0 streak bonus after refund in November", async () => {
    const res = await request(app).get("/api/commission/2/12/2024");
    expect(res.status).toBe(200);
    const parts = res.body.parts || {};
    expect(parts.streak_months).toBe(0);
    expect(parts.streak_bonus).toBe(0);
  });
});
