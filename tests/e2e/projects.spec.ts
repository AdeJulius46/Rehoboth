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

test("projects list renders stat cards and seeded rows", async ({ page }) => {
  await page.goto("/projects");
  await expect(page.getByText("Projects Overview")).toBeVisible();
  await expect(page.getByText("Total Projects")).toBeVisible();
  await expect(page.locator("table tbody tr").first()).toBeVisible();
});

test("creates, edits, and deletes a project", async ({ page }) => {
  const name = `Playwright Project ${Date.now()}`;

  await page.goto("/projects/new");
  await page.getByPlaceholder("Enter project name").fill(name);

  await page.getByText("Select Customer", { exact: true }).click();
  await page.waitForSelector('[data-slot="popover-content"]', { state: "visible" });
  await page.locator('[data-slot="popover-content"] button').first().click();

  await page.getByLabel("Start Date").fill("2026-01-15");
  await page.getByPlaceholder("Enter project value").fill("1500000");
  await page.getByRole("button", { name: "Create new" }).click();

  await expect(page).toHaveURL(/\/projects\/[a-z0-9]{20,}$/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name })).toBeVisible();

  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page).toHaveURL(/\/edit$/);
  const updatedName = `${name} Updated`;
  await page.getByPlaceholder("Enter project name").fill(updatedName);
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page).toHaveURL(/\/projects\/[a-z0-9]{20,}$/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name: updatedName })).toBeVisible();

  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page
    .locator('[data-slot="dialog-content"]')
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(page).toHaveURL(/\/projects$/, { timeout: 15000 });
});
