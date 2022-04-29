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

describe('Simple', () => {
  const { runner } = ProjectRunner.create({
    path: fixturePath,
    isClientOnly: true,
    shouldBuild: true,
    launchOptions: {
      // headless: false,
      // devtools: true,
    },
  }).beforeAndAfter();

  it('should be rendered only on scroll', async () => {
    const { page } = await runner.openPage(runner.baseUrl());

    let chunkLoaded = false;

    page.on('request', (request) => {
      if (request.url() === `${runner.baseUrl()}/lazy.js`) {
        chunkLoaded = true;
      }
    });

    expect(await page.$('#lazy')).toBeNull();
    expect(chunkLoaded).toEqual(false);

    await page.mouse.wheel(0, page.viewportSize()!.height * 2);

    await waitFor(async () => {
      expect(chunkLoaded).toEqual(true);
      expect(await page.$eval('#lazy', (el) => el.textContent)).toEqual('Lazy!');
    });
  });
});
