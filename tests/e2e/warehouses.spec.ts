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

test("warehouses list renders stat cards and seeded rows", async ({ page }) => {
  await page.goto("/warehouses");
  await expect(page.getByText("Warehouses Overview")).toBeVisible();
  await expect(page.getByText("Total Warehouses")).toBeVisible();
  await expect(page.locator("table tbody tr").first()).toBeVisible();
});

test("creates, edits, and deletes a warehouse", async ({ page }) => {
  const name = `Playwright Warehouse ${Date.now()}`;

  await page.goto("/warehouses/new");
  await page.getByPlaceholder("Enter warehouse name").fill(name);
  await page.getByPlaceholder("Enter full address").fill("1 Test Way, Lagos");
  await page.getByRole("button", { name: "Save Warehouse" }).click();

  await expect(page).toHaveURL(/\/warehouses\/[a-z0-9]{20,}$/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name })).toBeVisible();

  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page).toHaveURL(/\/edit$/);
  const updatedName = `${name} Updated`;
  await page.getByPlaceholder("Enter warehouse name").fill(updatedName);
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page).toHaveURL(/\/warehouses\/[a-z0-9]{20,}$/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name: updatedName })).toBeVisible();

  await page.getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Delete Warehouse" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page).toHaveURL(/\/warehouses$/, { timeout: 15000 });
});
