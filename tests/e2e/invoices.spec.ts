import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = "admin@rehobothsoftware.com";
const ADMIN_PASSWORD = "admin123";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("Enter your email").fill(ADMIN_EMAIL);
  await page.getByPlaceholder("Enter your password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Login now" }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
});

test("invoices list renders stat cards and seeded rows", async ({ page }) => {
  await page.goto("/invoices");
  await expect(page.getByText("Invoices Overview")).toBeVisible();
  await expect(page.getByText("Total Invoices")).toBeVisible();
  await expect(page.locator("table tbody tr").first()).toBeVisible();
});

async function pickFirst(page: import("@playwright/test").Page, triggerText: string) {
  await page.getByText(triggerText, { exact: true }).click();
  await page.waitForSelector('[data-slot="popover-content"]', { state: "visible" });
  await page.locator('[data-slot="popover-content"] button').first().click();
}

test("creates, edits, and deletes an invoice", async ({ page }) => {
  await page.goto("/invoices/new");

  await pickFirst(page, "Select customer");
  await page.locator("#due-date").fill("2026-12-31");
  await pickFirst(page, "Search products by name or code...");

  await page.getByRole("button", { name: "Create new" }).click();
  await expect(page).toHaveURL(/\/invoices\/[a-z0-9]{20,}$/, { timeout: 15000 });
  await expect(page.getByText("Items")).toBeVisible();

  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page).toHaveURL(/\/edit$/);
  await page.getByPlaceholder("Enter notes (optional)").fill("Playwright test note");
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page).toHaveURL(/\/invoices\/[a-z0-9]{20,}$/, { timeout: 15000 });

  await page.getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Delete Invoice" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page).toHaveURL(/\/invoices$/, { timeout: 15000 });
});
