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

describe('Force SSR', () => {
  const { runner } = ProjectRunner.create({
    path: fixturePath,
    shouldBuild: true,
    launchOptions: {
      // headless: false,
      // devtools: true,
    },
  }).beforeAndAfter();

  it('should be rendered only on scroll and also be included in the initial HTML', async () => {
    const { page, responses } = await runner.openPage(runner.baseUrl(), { captureResponses: true });
    const lazy = page.locator('#lazy');

    const initialContent = (await responses[0]!.body()).toString();
    expect(initialContent).toContain(
      '<div id="lazy" style="height:100vh;width:100vw;background:salmon"><h1>Lazy!</h1></div>'
    );

    expect(await page.$('#lazy')).toBeNull();

    await page.mouse.wheel(0, page.viewportSize()!.height * 2);

    await waitFor(async () => {
      expect(await lazy.textContent()).toEqual('Lazy!');
    });
  });
});
