import { expect } from 'expect';
import { ProjectRunner } from 'e2e-test-kit';
import { basename, dirname, join } from 'path';

const fixturePath = join(
  dirname(require.resolve('react-intersection-loader/package.json')),
  'test',
  'fixtures',
  basename(__filename).replace(/\.test\.js$/, '')
);

describe('Load', () => {
  const { runner } = ProjectRunner.create({
    path: fixturePath,
    isClientOnly: true,
    shouldBuild: true,
    launchOptions: {
      headless: false,
    },
  }).beforeAndAfter();

  it('should render component on scroll', async () => {
    const { page } = await runner.openPage(runner.baseUrl());

    // eslint-disable-next-line no-console
    console.log(page.url());
    expect(1).toEqual(2);
  });
});
