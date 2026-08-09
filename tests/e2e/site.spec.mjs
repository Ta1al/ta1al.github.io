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

test("homepage lists the three newest blog posts with live publication ages", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-08-10T07:00:00Z") });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const recentWriting = page.getByRole("region", { name: "Latest writing" });
  await expect(recentWriting.getByRole("listitem")).toHaveCount(3);
  await expect(recentWriting.getByRole("link")).toHaveCount(4);
  await expect(
    recentWriting.locator(".home-latest__item > a"),
  ).toHaveText([
    "The Guestbook | TryHackMe Room Writeup",
    "After Hours | TryHackMe Room Writeup",
    "Infinity Pool | TryHackMe Room Writeup",
  ]);
  await expect(
    recentWriting.getByRole("link", { name: "The Guestbook | TryHackMe Room Writeup" }),
  ).toHaveAttribute("href", "/blog/the-guestbook-tryhackme-writeup/");
  await expect(
    recentWriting.getByRole("link", { name: "After Hours | TryHackMe Room Writeup" }),
  ).toHaveAttribute("href", "/blog/after-hours-tryhackme-writeup/");
  await expect(
    recentWriting.getByRole("link", { name: "Infinity Pool | TryHackMe Room Writeup" }),
  ).toHaveAttribute("href", "/blog/infinity-pool-tryhackme-writeup/");
  await expect(
    recentWriting.getByRole("link", { name: "View all posts →" }),
  ).toHaveAttribute("href", "/blog/");

  const timestamps = recentWriting.locator("time[data-relative-age]");
  await expect(timestamps).toHaveCount(3);
  await expect(timestamps.nth(0)).toHaveAttribute(
    "datetime",
    "2026-08-08T23:21:00+05:00",
  );
  await expect(timestamps.nth(0)).toHaveText("Published 1 day ago");
});

test("homepage keeps only the latest post visible on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const recentWriting = page.getByRole("region", { name: "Latest writing" });
  await expect(recentWriting.locator(".home-latest__item:visible")).toHaveCount(
    1,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollHeight <= window.innerHeight,
    ),
  ).toBe(true);
});

test("menu traps focus, identifies the current section, and restores focus", async ({
  page,
}) => {
  await mockDiscordWidget(page);
  await gotoWithoutPageErrors(page, "/about/");
  const toggle = page.getByRole("button", { name: /toggle navigation/i });
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  const home = page.locator("#site-menu a").first();
  await expect(home).toBeFocused();
  await expect(home).toHaveCSS("outline-style", "none");
  const current = page.locator('#site-menu a[aria-current="page"]');
  await expect(current).toHaveText("About");
  await expect(current).toHaveCSS("color", "rgb(92, 225, 207)");
  await expect(current).toHaveAttribute("href", "/about/");
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("Enter");
  await expect(home).toBeFocused();
  await expect(home).toHaveCSS("outline-style", "solid");
});

test("menu navigation fits inside wide, short viewports", async ({ page }) => {
  await page.setViewportSize({ width: 1270, height: 648 });
  await mockDiscordWidget(page);
  await gotoWithoutPageErrors(page, "/about/");
  await page.getByRole("button", { name: /toggle navigation/i }).click();

  const geometry = await page.locator("#site-menu nav").evaluate((nav) => {
    const box = nav.getBoundingClientRect();
    const firstLink = nav.querySelector("a");

    return {
      top: box.top,
      bottom: box.bottom,
      fontSize: Number.parseFloat(getComputedStyle(firstLink).fontSize),
    };
  });

  expect(geometry.top).toBeGreaterThanOrEqual(0);
  expect(geometry.bottom).toBeLessThanOrEqual(648);
  expect(geometry.fontSize).toBeLessThan(80);
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
  const home = page.locator("#site-menu a").first();
  await expect(home).toBeFocused();
  await expect(home).toHaveCSS("outline-style", "none");

  await swipeHorizontally(page, 40, 300);
  await expect(page.locator("body")).not.toHaveClass(/menu-open/);
  await expect(home).toHaveCSS("outline-style", "none");
  await expect(page.locator("#site-menu")).toBeHidden();
  await expect(
    page.getByRole("button", { name: /toggle navigation/i }),
  ).toHaveAttribute("aria-expanded", "false");
});

test("scrolling a post code block does not open a drawer", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoWithoutPageErrors(page, "/projects/home-soc-lab/");

  const codeBlock = page.locator(".prose pre").first();
  await codeBlock.scrollIntoViewIfNeeded();
  const overflows = await codeBlock.evaluate(
    (element) => element.scrollWidth > element.clientWidth,
  );
  expect(overflows).toBe(true);

  const box = await codeBlock.boundingBox();
  expect(box).not.toBeNull();
  const y = box.y + box.height / 2;
  await swipeHorizontally(page, box.x + box.width - 20, box.x + 20, y);

  await expect(page.locator("body")).not.toHaveClass(/menu-open|toc-open/);
});

test("blog code blocks distinguish syntax token colors", async ({ page }) => {
  await gotoWithoutPageErrors(page, "/blog/packed-light-tryhackme-writeup/");

  const tokenColors = await Promise.all(
    [".n", ".k", ".nf", ".s2"].map((tokenClass) =>
      page
        .locator(`.chroma ${tokenClass}`)
        .first()
        .evaluate((element) => getComputedStyle(element).color),
    ),
  );

  expect(new Set(tokenColors).size).toBe(tokenColors.length);
});

test("posts provide clear archive and adjacent-reading navigation", async ({
  page,
}) => {
  await gotoWithoutPageErrors(page, "/blog/cybersecurity-incidents-lessons/");

  await expect(
    page.getByRole("link", { name: "Back to all posts" }),
  ).toHaveAttribute("href", "/blog/");

  const readingNavigation = page.getByRole("navigation", {
    name: "Continue reading",
  });
  await expect(
    readingNavigation.getByRole("link", {
      name: /Newer post.*How I Passed CompTIA Security\+ SY0-701/,
    }),
  ).toHaveAttribute("href", "/blog/how-i-passed-comptia-security-plus/");
  await expect(
    readingNavigation.getByRole("link", {
      name: /Older post.*Digital Footprint/,
    }),
  ).toHaveAttribute("href", "/blog/digital-footprint-tryhackme-writeup/");
  await expect(
    readingNavigation.getByRole("link", { name: "View all posts" }),
  ).toHaveAttribute("href", "/blog/");

  await expect(
    page.locator('a[href^="/tags/"], a[href^="/categories/"]'),
  ).toHaveCount(0);
});

test("blog topics provide curated navigation and complete collections", async ({
  page,
}) => {
  await gotoWithoutPageErrors(page, "/blog/");
  await expect(
    page.getByRole("link", { name: "Browse topics" }),
  ).toHaveAttribute("href", "/blog/topics/");

  await gotoWithoutPageErrors(page, "/blog/topics/");
  const tryHackMeTopic = page.locator("article.topic-card").filter({
    has: page.getByRole("link", {
      name: "TryHackMe Writeups",
      exact: true,
    }),
  });
  await expect(tryHackMeTopic).toHaveCount(1);
  await expect(
    tryHackMeTopic.getByRole("link", {
      name: "TryHackMe Writeups",
      exact: true,
    }),
  ).toHaveAttribute("href", "/blog/topics/tryhackme/");

  const entryLabel = await tryHackMeTopic.locator(".eyebrow").textContent();
  const entryCount = Number.parseInt(entryLabel, 10);
  expect(entryCount).toBeGreaterThan(0);

  await gotoWithoutPageErrors(page, "/blog/topics/tryhackme/");
  await expect(
    page.getByRole("heading", { name: "TryHackMe Writeups", level: 1 }),
  ).toBeVisible();
  await expect(page.locator("article.post-card")).toHaveCount(entryCount);
});

test("articles expose authorship, topic membership, and related reading", async ({
  page,
}) => {
  await gotoWithoutPageErrors(page, "/blog/packed-light-tryhackme-writeup/");

  await expect(
    page.getByRole("link", { name: "Talal Ahmed", exact: true }),
  ).toHaveAttribute("rel", "author");
  await expect(
    page.getByRole("link", { name: "Digital Forensics" }),
  ).toHaveAttribute("href", "/blog/topics/digital-forensics/");
  await expect(
    page.locator(".related-reading .related-reading__item"),
  ).toHaveCount(3);
});

test("the custom 404 page is excluded from indexing and structured data", async ({
  page,
}) => {
  await gotoWithoutPageErrors(page, "/404.html");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, follow",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(
    0,
  );
});

test("long articles reveal a back-to-top control after two viewports", async ({
  page,
}) => {
  await gotoWithoutPageErrors(page, "/projects/home-soc-lab/");
  const backToTop = page.getByRole("button", { name: "Back to top" });

  await expect(backToTop).toBeHidden();
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2.5));
  await expect(backToTop).toBeVisible();
  await backToTop.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(backToTop).toBeHidden();
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
