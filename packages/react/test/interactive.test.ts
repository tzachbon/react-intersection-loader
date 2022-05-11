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

describe('Interactive', () => {
  const { runner } = ProjectRunner.create({
    path: fixturePath,
    isClientOnly: true,
    shouldBuild: {
      bundle: true,
    },
    launchOptions: {
      // headless: false,
      // devtools: true,
      // slowMo: 250,
    },
  }).beforeAndAfter();

  it('should be rendered when visible with initial data and react to new data', async () => {
    const { page } = await runner.openPage(runner.baseUrl());
    const input = page.locator('input');
    const lazy = page.locator('#lazy');

    expect(await page.$('#lazy')).toBeNull();

    await input.type('initial-data');

    await page.mouse.wheel(0, page.viewportSize()!.height * 2);

    await waitFor(async () => {
      expect(await lazy.textContent()).toEqual('initial-data');
    });

    await input.evaluate((el: HTMLInputElement) => (el.value = ''));
    await input.type('new-data');

    await waitFor(async () => {
      expect(await lazy.textContent()).toEqual('new-data');
    });
  });
});
