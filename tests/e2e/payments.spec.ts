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

test("payments list renders stat cards and seeded rows", async ({ page }) => {
  await page.goto("/payments");
  await expect(page.getByText("Payments Overview")).toBeVisible();
  await expect(page.getByText("Total Payments")).toBeVisible();
  await expect(page.locator("table tbody tr").first()).toBeVisible();
});

test("creates, edits, and deletes a payment", async ({ page }) => {
  await page.goto("/payments/new");

  await page.getByText("Select customer", { exact: true }).click();
  await page.waitForSelector('[data-slot="popover-content"]', { state: "visible" });
  await page.locator('[data-slot="popover-content"] button').first().click();

  await page.locator("#payment-amount").fill("10000");
  await page.getByText("Select payment method", { exact: true }).click();
  await page.waitForTimeout(200);
  await page.getByRole("option", { name: "Cash" }).click();

  await page.getByRole("button", { name: "Create new" }).click();
  await expect(page).toHaveURL(/\/payments\/[a-z0-9]{20,}$/, { timeout: 15000 });
  await expect(page.getByText("Customer Information")).toBeVisible();

  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page).toHaveURL(/\/edit$/);
  await page.getByPlaceholder("Enter notes (optional)").fill("Playwright test note");
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page).toHaveURL(/\/payments\/[a-z0-9]{20,}$/, { timeout: 15000 });

  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page
    .locator('[data-slot="dialog-content"]')
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(page).toHaveURL(/\/payments$/, { timeout: 15000 });
});
