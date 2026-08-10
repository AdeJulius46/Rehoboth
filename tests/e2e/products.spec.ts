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

test("products list renders stat cards and seeded rows", async ({ page }) => {
  await page.goto("/products");
  await expect(page.getByText("Products Overview")).toBeVisible();
  await expect(page.getByText("Total Products")).toBeVisible();
  await expect(page.locator("table tbody tr").first()).toBeVisible();
});

test("creates, edits, and deletes a product", async ({ page }) => {
  const name = `Playwright Product ${Date.now()}`;

  await page.goto("/products/new");
  await page.getByPlaceholder("Enter product name").fill(name);
  await page.getByRole("combobox").first().click();
  await page.getByRole("option", { name: "Electronics" }).click();
  await page.getByRole("combobox").nth(1).click();
  await page.getByRole("option", { name: "pcs" }).click();
  await page.getByPlaceholder("Enter Cost Price").fill("10000");
  await page.getByPlaceholder("Enter Selling Price").fill("15000");
  await page.getByRole("button", { name: "Save Product" }).click();

  await expect(page).toHaveURL(/\/products\/[a-z0-9]{20,}$/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name })).toBeVisible();

  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page).toHaveURL(/\/edit$/);
  const updatedName = `${name} Updated`;
  await page.getByPlaceholder("Enter product name").fill(updatedName);
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page).toHaveURL(/\/products\/[a-z0-9]{20,}$/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name: updatedName })).toBeVisible();

  await page.getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Delete Product" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page).toHaveURL(/\/products$/, { timeout: 15000 });
});
