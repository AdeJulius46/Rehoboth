import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(`${BASE}/login`);
await page.getByPlaceholder("Enter your email").fill("admin@rehobothsoftware.com");
await page.getByPlaceholder("Enter your password").fill("admin123");
await page.getByRole("button", { name: "Login now" }).click();
await page.waitForURL(/\/dashboard/, { timeout: 15000 });

page.goto(`${BASE}/projects`, { waitUntil: "commit", timeout: 90000 }).catch((e) => console.log("nav error:", e.message));
console.log("navigation fired, sleeping...");
await new Promise((r) => setTimeout(r, 15000));
console.log("done sleeping, leaving page open for inspection");
