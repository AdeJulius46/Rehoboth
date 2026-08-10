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

test("staffs list renders stat cards and seeded rows", async ({ page }) => {
  await page.goto("/staffs");
  await expect(page.getByText("Staffs Overview")).toBeVisible();
  await expect(page.getByText("Total Staff")).toBeVisible();
  await expect(page.locator("table tbody tr").first()).toBeVisible();
});

test("creates, edits, and deletes a staff member", async ({ page }) => {
  const name = `Playwright Staff ${Date.now()}`;
  const email = `pw-staff-${Date.now()}@example.com`;

  await page.goto("/staffs/new");
  await page.getByPlaceholder("Enter full name").fill(name);
  await page.getByRole("combobox").first().click();
  await page.getByRole("option", { name: "Manager", exact: true }).click();
  await page.getByPlaceholder("Enter Phone Number").fill("08011112222");
  await page.getByRole("combobox").nth(1).click();
  await page.getByRole("option", { name: "Sales", exact: true }).click();
  await page.getByPlaceholder("Enter Email Address").fill(email);
  await page.getByPlaceholder("Enter Salary").fill("250000");
  await page.getByRole("button", { name: "Save Staff" }).click();

  await expect(page).toHaveURL(/\/staffs\/[a-z0-9]{20,}$/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name })).toBeVisible();

  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page).toHaveURL(/\/edit$/);
  const updatedName = `${name} Updated`;
  await page.getByPlaceholder("Enter full name").fill(updatedName);
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page).toHaveURL(/\/staffs\/[a-z0-9]{20,}$/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name: updatedName })).toBeVisible();

  await page.getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Delete Staff" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page).toHaveURL(/\/staffs$/, { timeout: 15000 });
});
