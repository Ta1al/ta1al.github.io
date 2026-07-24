import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const integrations = JSON.parse(
  readFileSync(new URL("../../data/integrations.json", import.meta.url)),
);

async function mockDiscordWidget(page) {
  const discord = integrations.discord;
  await page.route(discord.widgetUrl, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: discord.guildId,
        name: discord.name,
        presence_count: 3,
        instant_invite: discord.inviteUrl,
      }),
    }),
  );
}

async function swipeHorizontally(page, startX, endX, y = 420) {
  const session = await page.context().newCDPSession(page);
  await session.send("Emulation.setTouchEmulationEnabled", {
    enabled: true,
    maxTouchPoints: 1,
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: startX, y }],
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: endX, y }],
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await session.detach();
}

async function gotoWithoutPageErrors(page, path) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(100);
  expect(errors).toEqual([]);
}

test("menu traps focus, identifies the current section, and restores focus", async ({
  page,
}) => {
  await mockDiscordWidget(page);
  await gotoWithoutPageErrors(page, "/about/");
  const toggle = page.getByRole("button", { name: /toggle navigation/i });
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("link", { name: "About" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});

test("project filter buttons expose pressed state and filter one collection", async ({
  page,
}) => {
  await gotoWithoutPageErrors(page, "/projects/");
  const software = page.getByRole("button", { name: /software engineering/i });
  await software.click();
  await expect(software).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.locator('[data-project-discipline="software"]:visible'),
  ).toHaveCount(7);
  await expect(
    page.locator('[data-project-discipline="cybersecurity"]:visible'),
  ).toHaveCount(0);
});

test("CV tabs and mobile skill accordions remain keyboard-operable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoWithoutPageErrors(page, "/cv/");
  await expect(page.locator("[data-cv-tabs]")).toHaveClass(/cv-tabs--ready/);
  const software = page.getByRole("tab", { name: "Software Engineer" });
  await page.getByRole("tab", { name: "SOC Analyst" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(software).toHaveAttribute("aria-selected", "true");
  await expect(software).toBeFocused();
  await expect(page.locator('[data-cv-panel="software"]')).toBeVisible();

  const skill = page
    .locator('[data-cv-panel="software"] .skill-group__toggle')
    .first();
  await skill.click();
  await expect(skill).toHaveAttribute("aria-expanded", "true");
});

test("achievement tabs and the shared lightbox work together", async ({
  page,
}) => {
  await gotoWithoutPageErrors(page, "/achievements/");
  await page.getByRole("tab", { name: "All" }).click();
  await page.getByRole("tab", { name: /Credly/ }).click();
  await expect(page.locator('[data-achievement-panel="credly"]')).toBeVisible();

  const image = page
    .locator('[data-achievement-panel="credly"] [data-achievement-image]')
    .first();
  await image.click();
  await expect(page.locator("[data-achievement-lightbox]")).toHaveAttribute(
    "open",
    "",
  );
  await page.keyboard.press("Escape");
  await expect(image).toBeFocused();
});

test("mobile article TOC keeps keyboard focus inside its drawer", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoWithoutPageErrors(page, "/projects/home-soc-lab/");
  await page.locator("[data-toc-open]").click();
  await page.keyboard.press("Shift+Tab");
  const focusIsInside = await page.evaluate(() =>
    document
      .querySelector("[data-article-toc]")
      .contains(document.activeElement),
  );
  expect(focusIsInside).toBe(true);
});

test("post swipes route to the TOC and navigation drawers", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoWithoutPageErrors(page, "/projects/home-soc-lab/");

  await swipeHorizontally(page, 40, 300);
  await expect(page.locator("body")).toHaveClass(/toc-open/);

  await swipeHorizontally(page, 300, 40);
  await expect(page.locator("body")).not.toHaveClass(/toc-open/);

  await swipeHorizontally(page, 300, 40);
  await expect(page.locator("body")).toHaveClass(/menu-open/);

  await swipeHorizontally(page, 40, 300);
  await expect(page.locator("body")).not.toHaveClass(/menu-open/);
  await expect(
    page.getByRole("button", { name: /toggle navigation/i }),
  ).toHaveAttribute("aria-expanded", "false");
});

test("Discord service failure keeps usable fallback content", async ({
  page,
}) => {
  await page.route("https://discord.com/api/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "Service unavailable" }),
    }),
  );
  await gotoWithoutPageErrors(page, "/about/");
  await expect(page.locator("[data-discord-presence]")).toContainText(
    "Live presence is unavailable",
  );
  await expect(page.locator("[data-discord-invite]")).toHaveAttribute(
    "href",
    /discord\.com\/invite/,
  );
});

for (const path of [
  "/",
  "/about/",
  "/achievements/",
  "/projects/",
  "/blog/how-i-passed-comptia-security-plus/",
  "/projects/home-soc-lab/",
  "/cv/",
]) {
  test(`has no serious accessibility violations at ${path}`, async ({
    page,
  }) => {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const serious = results.violations.filter(({ impact }) =>
      ["serious", "critical"].includes(impact),
    );
    expect(serious).toEqual([]);
  });
}
