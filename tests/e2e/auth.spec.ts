import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = "admin@rehobothsoftware.com";
const ADMIN_PASSWORD = "admin123";

test("unauthenticated users are redirected to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("wrong credentials show an inline error", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("Enter your email").fill(ADMIN_EMAIL);
  await page.getByPlaceholder("Enter your password").fill("wrong-password");
  await page.getByRole("button", { name: "Login now" }).click();
  await expect(page.getByText("Invalid email or password")).toBeVisible({ timeout: 15000 });
  await expect(page).toHaveURL(/\/login/);
});

test("login redirects to dashboard, session persists, and logout redirects back to login", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByPlaceholder("Enter your email").fill(ADMIN_EMAIL);
  await page.getByPlaceholder("Enter your password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Login now" }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  await expect(page.getByText(ADMIN_EMAIL)).toBeVisible();

  await page.reload();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.getByText(ADMIN_EMAIL).click();
  await page.getByRole("menuitem", { name: /Log out/i }).click();
  await expect(page).toHaveURL(/\/login/, { timeout: 15000 });

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});
