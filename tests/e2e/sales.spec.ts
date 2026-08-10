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

test("sales list renders stat cards and seeded rows", async ({ page }) => {
  await page.goto("/sales");
  await expect(page.getByText("Sales Overview")).toBeVisible();
  await expect(page.getByText("Total Revenue")).toBeVisible();
  await expect(page.locator("table tbody tr").first()).toBeVisible();
});

async function pickFirstOption(page: import("@playwright/test").Page, triggerText: string) {
  await page.getByText(triggerText, { exact: true }).click();
  await page.waitForSelector('[data-slot="popover-content"]', { state: "visible" });
  await page.locator('[data-slot="popover-content"] button').first().click();
}

test("creates, edits, and deletes a sale", async ({ page }) => {
  await page.goto("/sales/new");

  await pickFirstOption(page, "Select customer");
  await pickFirstOption(page, "Select warehouse");
  await pickFirstOption(page, "Search products by name or SKU...");

  await expect(page.getByText("Total Items: 1")).toBeVisible();
  await page.getByRole("button", { name: "Save Sale" }).click();

  await expect(page).toHaveURL(/\/sales\/[a-z0-9]{20,}$/, { timeout: 15000 });
  await expect(page.getByText("Items")).toBeVisible();

  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page).toHaveURL(/\/edit$/);
  await page.getByPlaceholder("Enter notes (optional)").fill("Playwright test note");
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page).toHaveURL(/\/sales\/[a-z0-9]{20,}$/, { timeout: 15000 });

  await page.getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Delete Sale" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page).toHaveURL(/\/sales$/, { timeout: 15000 });
});
