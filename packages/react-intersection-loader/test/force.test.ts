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

describe('Force', () => {
  const { runner } = ProjectRunner.create({
    path: fixturePath,
    isClientOnly: true,
    shouldBuild: true,
    launchOptions: {
      // headless: false,
      // devtools: true,
    },
  }).beforeAndAfter();

  it('should be rendered regardless of visibility', async () => {
    const { page } = await runner.openPage(runner.baseUrl());

    await waitFor(async () => {
      expect(await page.locator('#lazy').textContent()).toEqual('Forced to be in screen');
    });
  });
});
