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

test("agents list renders stat cards and seeded rows", async ({ page }) => {
  await page.goto("/agents");
  await expect(page.getByText("Agents Overview")).toBeVisible();
  await expect(page.getByText("Total Agents")).toBeVisible();
  await expect(page.locator("table tbody tr").first()).toBeVisible();
});

test("creates, edits, and deletes an agent", async ({ page }) => {
  const name = `Playwright Agent ${Date.now()}`;
  const email = `pw-agent-${Date.now()}@example.com`;

  await page.goto("/agents/new");
  await page.getByPlaceholder("Enter full name").fill(name);
  await page.getByRole("combobox").first().click();
  await page.getByRole("option", { name: "Lagos" }).click();
  await page.getByPlaceholder("Enter Phone Number").fill("08011112222");
  await page.getByPlaceholder("Enter Email Address").fill(email);
  await page.getByPlaceholder("Enter Commission Rate").fill("10");
  await page.getByRole("button", { name: "Save Agent" }).click();

  await expect(page).toHaveURL(/\/agents\/[a-z0-9]{20,}$/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name })).toBeVisible();

  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page).toHaveURL(/\/edit$/);
  const updatedName = `${name} Updated`;
  await page.getByPlaceholder("Enter full name").fill(updatedName);
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page).toHaveURL(/\/agents\/[a-z0-9]{20,}$/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name: updatedName })).toBeVisible();

  await page.getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Delete Agent" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page).toHaveURL(/\/agents$/, { timeout: 15000 });
});
