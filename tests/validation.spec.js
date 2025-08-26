import request from "supertest";
import app from "../src/app.js";

describe("User validation", () => {
  test("Reject invalid email and short name", async () => {
    const payload = { name: "A", email: "bademail", region: "north", hire_date: "2025-01-01" };
    const res = await request(app).post("/api/users").send(payload);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.details).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: "name" }),
      expect.objectContaining({ field: "email" })
    ]));
  });
});
