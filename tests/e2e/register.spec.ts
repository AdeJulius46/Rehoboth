import { test, expect } from "@playwright/test";

test("completes the full registration wizard and lands back on login", async ({ page }) => {
  const email = `pw-${Date.now()}@example.com`;

  await page.goto("/register");
  await page.getByPlaceholder("Enter your full name").fill("Playwright User");
  await page.getByPlaceholder("Enter your email").fill(email);
  await page.getByPlaceholder("Create password").fill("SuperSecret123");
  await page.getByPlaceholder("Confirm your password").fill("SuperSecret123");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Create Account" }).click();

  const toast = page.locator("[data-sonner-toast]").first();
  await expect(toast).toBeVisible({ timeout: 15000 });
  const text = await toast.innerText();
  const match = text.match(/(\d{8})/);
  if (!match) throw new Error(`Could not find security code in toast: ${text}`);

  await page.getByText("Security code").locator("..").locator("input").fill(match[1]);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Complete your details")).toBeVisible({ timeout: 15000 });

  // Full name should carry over from the Create Account step.
  await expect(page.getByPlaceholder("Enter your full name")).toHaveValue("Playwright User");

  await page.getByPlaceholder("Enter your phone number").fill("08000000000");
  await page.getByPlaceholder("Enter your job title").fill("Tester");
  await page.getByRole("combobox").click();
  await page.getByRole("option").first().click();
  await page.getByRole("button", { name: "Continue" }).click();

  // Company step only appears for the very first registrant in a fresh database.
  const companyStep = page.getByText("Complete your company data");
  if (await companyStep.isVisible({ timeout: 15000 }).catch(() => false)) {
    await page.getByPlaceholder("Enter your company name").fill("Playwright Test Co");
    await page.getByRole("combobox").nth(1).click();
    await page.getByRole("option").first().click();
    await page.getByRole("combobox").nth(2).click();
    await page.getByRole("option").first().click();
    await page.getByPlaceholder("Enter business address").fill("1 Test Way");
    await page.getByRole("button", { name: "Continue" }).click();
  }

  await expect(page.getByText("Set up your preferences")).toBeVisible({ timeout: 15000 });
  await page.getByText("Sales Agent", { exact: true }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByText("Registration complete!")).toBeVisible({ timeout: 15000 });
  await page.getByRole("button", { name: "Go to home" }).click();

  await expect(page).toHaveURL(/\/login\?registered=1/);
});

test("rejects mismatched passwords on the create-account step", async ({ page }) => {
  await page.goto("/register");
  await page.getByPlaceholder("Enter your full name").fill("Mismatch User");
  await page.getByPlaceholder("Enter your email").fill(`mismatch-${Date.now()}@example.com`);
  await page.getByPlaceholder("Create password").fill("SuperSecret123");
  await page.getByPlaceholder("Confirm your password").fill("DoesNotMatch");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page.getByText("Passwords do not match")).toBeVisible();
});
