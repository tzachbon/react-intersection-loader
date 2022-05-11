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
    shouldBuild: {
      bundle: true,
    },
    launchOptions: {
      // headless: false,
      // devtools: true,
    },
  }).beforeAndAfter();

  it('should be rendered only on scroll one by one', async () => {
    const { page, responses } = await runner.openPage(runner.baseUrl(), { captureResponses: true });
    const lazyOne = page.locator('#lazy-one');
    const lazyTwo = page.locator('#lazy-two');

    expect(await page.$('#lazy-one')).toBeNull();
    expect(responses.map((r) => r.url())).not.toEqual(expect.arrayContaining([`${runner.baseUrl()}/lazy-one.js`]));

    await page.mouse.wheel(0, page.viewportSize()!.height * 2);

    await waitFor(async () => {
      expect(responses.map((r) => r.url())).toEqual(expect.arrayContaining([`${runner.baseUrl()}/lazy-one.js`]));
      expect(await lazyOne.textContent()).toEqual('lazy-one');
    });

    expect(await page.$('#lazy-two')).toBeNull();
    expect(responses.map((r) => r.url())).not.toEqual(expect.arrayContaining([`${runner.baseUrl()}/lazy-two.js`]));

    await page.mouse.wheel(0, page.viewportSize()!.height * 2);

    await waitFor(async () => {
      expect(responses.map((r) => r.url())).toEqual(expect.arrayContaining([`${runner.baseUrl()}/lazy-two.js`]));
      expect(await lazyTwo.textContent()).toEqual('lazy-two');
    });
  });
});
