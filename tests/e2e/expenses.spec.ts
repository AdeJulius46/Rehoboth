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

test("expenses list renders stat cards and seeded rows", async ({ page }) => {
  await page.goto("/expenses");
  await expect(page.getByText("Expenses Overview")).toBeVisible();
  await expect(page.getByText("Total Expenses")).toBeVisible();
  await expect(page.locator("table tbody tr").first()).toBeVisible();
});

test("creates, edits, and deletes an expense", async ({ page }) => {
  const description = `Playwright Expense ${Date.now()}`;

  await page.goto("/expenses/new");
  await page.getByText("Select Category", { exact: true }).click();
  await page.waitForTimeout(200);
  await page.getByRole("option", { name: "Travel" }).click();
  await page.getByPlaceholder("Enter Description").fill(description);
  await page.getByPlaceholder("Enter amount").fill("15000");
  await page.locator('input[type="date"]').fill("2026-07-01");

  await page.getByRole("button", { name: "Create new" }).click();
  await expect(page).toHaveURL(/\/expenses\/[a-z0-9]{20,}$/, { timeout: 15000 });
  await expect(page.getByText(description)).toBeVisible();

  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page).toHaveURL(/\/edit$/);
  const updatedDescription = `${description} Updated`;
  await page.getByPlaceholder("Enter Description").fill(updatedDescription);
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page).toHaveURL(/\/expenses\/[a-z0-9]{20,}$/, { timeout: 15000 });
  await expect(page.getByText(updatedDescription)).toBeVisible();

  await page.getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Delete Expense" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page).toHaveURL(/\/expenses$/, { timeout: 15000 });
});
