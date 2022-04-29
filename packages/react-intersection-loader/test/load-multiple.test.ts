import { expect } from 'expect';
import { ProjectRunner } from 'e2e-test-kit';
import { basename, dirname, join } from 'path';
import { waitFor } from 'promise-assist';

const fixturePath = join(
  dirname(require.resolve('react-intersection-loader/package.json')),
  'test',
  'fixtures',
  basename(__filename).replace(/\.test\.js$/, '')
);

describe('Load multiple', () => {
  const { runner } = ProjectRunner.create({
    path: fixturePath,
    isClientOnly: true,
    shouldBuild: true,
    launchOptions: {
      // headless: false,
      // devtools: true,
    },
  }).beforeAndAfter();

  it('should be rendered only on scroll one by one', async () => {
    const { page } = await runner.openPage(runner.baseUrl());
    const lazyOne = page.locator('#lazy-one');
    const lazyTwo = page.locator('#lazy-two');

    let lazyOneLoaded = false;
    let lazyTwoLoaded = false;

    page.on('request', (request) => {
      if (request.url() === `${runner.baseUrl()}/lazy-one.js`) {
        lazyOneLoaded = true;
      }

      if (request.url() === `${runner.baseUrl()}/lazy-two.js`) {
        lazyTwoLoaded = true;
      }
    });

    expect(await page.$('#lazy-one')).toBeNull();
    expect(lazyOneLoaded).toEqual(false);

    await page.mouse.wheel(0, page.viewportSize()!.height * 2);

    await waitFor(async () => {
      expect(lazyOneLoaded).toEqual(true);
      expect(await lazyOne.textContent()).toEqual('lazy-one');
    });

    expect(await page.$('#lazy-two')).toBeNull();
    expect(lazyTwoLoaded).toEqual(false);

    await page.mouse.wheel(0, page.viewportSize()!.height * 2);

    await waitFor(async () => {
      expect(lazyTwoLoaded).toEqual(true);
      expect(await lazyTwo.textContent()).toEqual('lazy-two');
    });
  });
});
