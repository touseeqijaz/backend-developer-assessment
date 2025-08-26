import request from "supertest";
import app from "../src/app.js";

describe("Bulk Sales Import validation", () => {
  test("Mixed valid/invalid bulk import", async () => {
    const bulk = [
      { user_id: 1, amount: 5000, date: "2024-12-01", product_category: "software" },
      { user_id: 1, amount: 5000, date: "2024-12-01", product_category: "software" }, // duplicate in payload
      { user_id: 999, amount: 3000, date: "2024-12-02", product_category: "hardware" }, // invalid user
      { user_id: 2, amount: -500, date: "2024-12-03", product_category: "consulting" }, // negative
      { user_id: 2, amount: 2000, date: "2026-08-01", product_category: "support" } // far future
    ];
    const res = await request(app).post("/api/sales/bulk").send(bulk);
    expect(res.status).toBe(200);
    expect(res.body.failed).toBeGreaterThanOrEqual(1);
    // valid first record should be inserted
    expect(res.body.inserted.length).toBeGreaterThanOrEqual(1);
  });
});
