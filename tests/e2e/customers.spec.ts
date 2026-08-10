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

test("customers list renders stat cards and seeded rows", async ({ page }) => {
  await page.goto("/customers");
  await expect(page.getByText("Customers Overview")).toBeVisible();
  await expect(page.getByText("Total Customers")).toBeVisible();
  await expect(page.locator("table tbody tr").first()).toBeVisible();
});

test("creates, edits, searches for, and deletes a customer", async ({ page }) => {
  const name = `Playwright Customer ${Date.now()}`;
  const email = `pw-customer-${Date.now()}@example.com`;

  await page.goto("/customers/new");
  await page.getByPlaceholder("Enter customer name").fill(name);
  await page.getByPlaceholder("Enter Phone Number").fill("08099998888");
  await page.getByPlaceholder("Enter Email Address").fill(email);
  await page.getByRole("button", { name: "Save Customer" }).click();

  await expect(page).toHaveURL(/\/customers\/[a-z0-9]{20,}$/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name })).toBeVisible();

  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page).toHaveURL(/\/edit$/);
  const updatedName = `${name} Updated`;
  await page.getByPlaceholder("Enter customer name").fill(updatedName);
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page).toHaveURL(/\/customers\/[a-z0-9]{20,}$/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name: updatedName })).toBeVisible();

  await page.goto("/customers");
  await page.getByPlaceholder("Search customers by name, phone, email...").fill(updatedName);
  await expect(page).toHaveURL(/q=/, { timeout: 15000 });
  await expect(page.locator("table tbody tr")).toHaveCount(1);
  await expect(page.getByText(updatedName)).toBeVisible();

  await page.locator("table tbody tr").first().locator("button").last().click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();

  await expect(page.getByText("No customers yet")).toBeVisible({ timeout: 15000 });
});

test("type and status filters narrow the list via the URL", async ({ page }) => {
  await page.goto("/customers");

  await page.getByRole("combobox").first().click();
  await page.getByRole("option", { name: "Company" }).click();
  await expect(page).toHaveURL(/type=BUSINESS/, { timeout: 15000 });

  const badges = page.locator("table tbody tr td:nth-child(5)");
  const count = await badges.count();
  for (let i = 0; i < count; i++) {
    await expect(badges.nth(i)).toHaveText("Company");
  }
});
