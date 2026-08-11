import { newE2EPage } from "@arcgis/lumina-compiler/puppeteerTesting";
import { expect, it } from "vitest";

import { html } from "../../../support/formatting";
import { CSS } from "./resources";

const noticeContent = html`
  <div slot="title">Title Text</div>
  <div slot="message">Message Text</div>
  <calcite-link slot="link" href="">Action</calcite-link>
`;

it("renders default props when none are provided", async () => {
  const page = await newE2EPage();
  await page.setContent(`
    <calcite-notice>
    <div slot="title">Title Text</div>
    <div slot="message">Message Text</div>
    <calcite-link slot="link" href="">Action</calcite-link>
    </calcite-notice>`);
  const element = await page.find("calcite-notice");
  const close = await page.find(`calcite-notice >>> .${CSS.close}`);
  const icon = await page.find(`calcite-notice >>> .${CSS.icon}`);
  expect(element).toEqualAttribute("kind", "brand");
  expect(close).toBeNull();
  expect(icon).toBeNull();
});

it("renders requested props when valid props are provided", async () => {
  const page = await newE2EPage();
  await page.setContent(`
    <calcite-notice kind="warning" closable>
    ${noticeContent}
    </calcite-notice>`);

  const element = await page.find("calcite-notice");
  const close = await page.find(`calcite-notice >>> .${CSS.close}`);
  const icon = await page.find(`calcite-notice >>> .${CSS.icon}`);

  expect(element).toEqualAttribute("kind", "warning");
  expect(close).not.toBeNull();
  expect(icon).toBeNull();
});

it("renders an icon and close button when requested", async () => {
  const page = await newE2EPage();
  await page.setContent(`
    <calcite-notice icon closable>
    ${noticeContent}
    </calcite-notice>`);

  const close = await page.find(`calcite-notice >>> .${CSS.close}`);
  const icon = await page.find(`calcite-notice >>> .${CSS.icon}`);
  expect(close).not.toBeNull();
  expect(icon).not.toBeNull();
});

it("hides content from assistive technology and keyboard users when closed", async () => {
  const page = await newE2EPage();
  await page.setContent(
    html`<calcite-notice closable> ${noticeContent} </calcite-notice>
      <button id="after-notice" type="button">After notice</button>`,
  );

  async function getAccessibilityTree(): Promise<string> {
    return JSON.stringify(await page.accessibility.snapshot({ interestingOnly: false }));
  }

  expect(await getAccessibilityTree()).not.toContain("Message Text");

  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement.id)).toBe("after-notice");

  const element = await page.find("calcite-notice");
  element.setProperty("open", true);
  await page.waitForChanges();

  expect(await getAccessibilityTree()).toContain("Message Text");
});

it("successfully closes a closable notice", async () => {
  const page = await newE2EPage();
  await page.setContent(html`<calcite-notice id="notice-1" open closable> ${noticeContent} </calcite-notice>`);

  const notice1 = await page.find("#notice-1 >>> .container");
  const noticeClose1 = await page.find(`#notice-1 >>> .${CSS.close}`);
  const animationDurationInMs = 400;

  expect(await notice1.isVisible()).toBe(true);

  await noticeClose1.click();
  await page.waitForTimeout(animationDurationInMs);
  expect(await notice1.isVisible()).not.toBe(true);
});
