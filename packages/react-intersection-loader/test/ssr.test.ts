import { ProjectRunner } from 'e2e-test-kit';
import { expect } from 'expect';
import { basename, dirname, join } from 'path';
import { waitFor } from 'promise-assist';

const fixturePath = join(
  dirname(require.resolve('react-intersection-loader/package.json')),
  'test',
  'fixtures',
  basename(__filename).replace(/\.test\.js$/, '')
);

describe('SSR', () => {
  const { runner } = ProjectRunner.create({
    path: fixturePath,
    shouldBuild: true,
    launchOptions: {
      // headless: false,
      // devtools: true,
    },
  }).beforeAndAfter();

  it('should be rendered only on scroll', async () => {
    const { page } = await runner.openPage(runner.baseUrl());
    const lazy = page.locator('#lazy');

    expect(await page.$('#lazy')).toBeNull();

    await page.mouse.wheel(0, page.viewportSize()!.height * 2);

    await waitFor(async () => {
      expect(await lazy.textContent()).toEqual('Lazy!');
    });
  });
});
