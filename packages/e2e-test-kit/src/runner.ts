import {
  after as mochaAfter,
  afterEach as mochaAfterEach,
  before as mochaBefore,
  type HookFunction as MochaHook,
} from 'mocha';
import playwright, { LaunchOptions, type Browser } from 'playwright';
import { Ports } from 'ensure-port';
import { runService, serve } from './serve';
import { createTempDirectorySync, loadDirSync } from './file-system-helpers';
import type { IFileSystem } from '@file-services/types';
import { nodeFs } from '@file-services/node';
import webpack from 'webpack';
import { promisify } from 'util';
import { once } from 'events';
import { fork } from 'child_process';

interface TestHooks {
  after?: MochaHook;
  afterEach?: MochaHook;
  before?: MochaHook;
}

interface BuildOptions {
  bundle: boolean;
  typescript: boolean;
}

interface ProjectRunnerOptions {
  launchOptions?: LaunchOptions;
  timeout?: number;
  isClientOnly?: boolean;
  shouldBuild?: boolean | Partial<BuildOptions>;
  path: string;
  log?: boolean;
  fs?: IFileSystem;
  throwOnBuildError?: boolean;
  port?: number;
}

export class ProjectRunner {
  private destroyCallbacks = new Set<() => void>();
  private browser: Browser | undefined;
  private browserContexts: playwright.BrowserContext[] = [];
  private ports: Ports;
  public log: Function;
  public port: number | undefined;
  private stats: webpack.Stats | null | undefined = undefined;

  private fs: IFileSystem;
  private throwOnBuildError: boolean;
  private buildOptions: BuildOptions;

  private constructor(private options: ProjectRunnerOptions) {
    this.fs = this.options.fs ?? nodeFs;
    this.throwOnBuildError = this.options.throwOnBuildError ?? true;
    // eslint-disable-next-line no-console
    this.log = this.options.log ? console.log.bind(console, '[ProjectRunner]') : () => void 0;
    this.ports = new Ports({ startPort: 8000, endPort: 9000 }, { fs: this.fs });
    this.buildOptions =
      typeof this.options.shouldBuild === 'boolean'
        ? { bundle: this.options.shouldBuild, typescript: this.options.shouldBuild }
        : { bundle: true, typescript: true, ...this.options.shouldBuild };
  }

  static create(runnerOptions: ProjectRunnerOptions) {
    runnerOptions.timeout ??= 40_000;

    const runner = new this(runnerOptions);
    const response = {
      runner,
    };

    return {
      ...response,
      beforeAndAfter,
    };

    function beforeAndAfter({ after = mochaAfter, afterEach = mochaAfterEach, before = mochaBefore }: TestHooks = {}) {
      before('bundle and serve project', async function () {
        this.timeout(runnerOptions.timeout!);

        await runner.run();
      });

      afterEach('cleanup open pages', async () => {
        await runner.closeAllPages();
        await runner.ports.release();
      });

      after('destroy runner', async () => {
        await runner.destroy();
        await runner.ports.dispose();
      });

      return response;
    }
  }

  public baseUrl() {
    if (!this.port) {
      throw new Error('Cannot get base url before runner is started');
    }

    return `http://localhost:${this.port}`;
  }

  public async run() {
    this.port = this.options.port ?? (await this.ports.ensure());

    this.prepareBuild(this.options.path);

    if (this.buildOptions.typescript) {
      await this.buildTypescript();
    }

    if (this.buildOptions.bundle) {
      await this.bundle();
    }

    const { close } = await (this.options.isClientOnly
      ? serve(this.outputDir, this.port)
      : runService(require.resolve(this.fs.join(this.outputDir, 'server')), this.port));

    this.destroyCallbacks.add(() => close());

    await this.createBrowser();
  }

  public buildTypescript() {
    const configPath = this.fs.join(this.options.path, 'tsconfig.json');
    const tscPath = this.fs.join(this.fs.dirname(require.resolve('typescript/package.json')), 'bin', 'tsc');

    return once(fork(tscPath, ['-p', configPath]), 'exit').then(([code]) => {
      if (this.throwOnBuildError && code === 1) {
        throw new Error(`tsc exited with code ${String(code)}`);
      }
    });
  }

  public async closeAllPages() {
    for (const browserContext of this.browserContexts) {
      await browserContext.close();
    }
    this.browserContexts.length = 0;
  }

  public async openPage(url: string, { captureResponses }: { captureResponses?: boolean } = {}) {
    await this.createBrowser();

    const browserContext = await this.browser!.newContext();
    this.browserContexts.push(browserContext);

    const page = await browserContext.newPage();

    const responses: playwright.Response[] = [];
    if (captureResponses) {
      page.on('response', (response) => responses.push(response));
    }
    await page.goto(url, { waitUntil: 'networkidle' });
    return { page, responses };
  }

  public async destroy() {
    await this.closeAllPages();

    for (const cb of this.destroyCallbacks) {
      cb();
    }
  }

  private async createBrowser() {
    if (!this.browser) {
      if (process.env.ENDPOINT_URL) {
        this.browser = await playwright.chromium.connectOverCDP(process.env.ENDPOINT_URL, this.options.launchOptions);
      } else {
        this.browser = await playwright.chromium.launch(this.options.launchOptions);
      }
    }
  }

  private prepareBuild(projectRoot: string) {
    const tempDir = createTempDirectorySync(`e2e-test-kit-build-${Date.now()}`);

    this.destroyCallbacks.add(() => tempDir.remove());

    this.fs.copyDirectorySync(projectRoot, tempDir.path);
    this.fs.symlinkSync(
      this.fs.join(__dirname, '../../../node_modules'), // #1
      this.fs.join(tempDir.path, 'node_modules'),
      'junction'
    );

    this.options.path = tempDir.path;
  }

  private async bundle() {
    this.log('Bundle Start');
    const config = this.loadWebpackConfig(this.options.path);
    const compiler = webpack({
      ...config,
      output: { path: this.outputDir, ...config.output },
    });

    this.stats = await promisify(compiler.run.bind(compiler))();
    if (this.throwOnBuildError && this.stats?.hasErrors()) {
      throw new Error(this.stats.toString({ colors: true }));
    }
    this.log('Bundle Finished');
  }

  public getBuildErrorMessagesDeep() {
    function getErrors(compilations: webpack.Compilation[]) {
      return compilations.reduce((errors, compilation) => {
        errors.push(...compilation.errors);
        errors.push(...getErrors(compilation.children));
        return errors;
      }, [] as webpack.WebpackError[]);
    }

    return getErrors([this.stats!.compilation]);
  }
  public getBuildWarningsMessagesDeep() {
    function getWarnings(compilations: webpack.Compilation[]) {
      return compilations.reduce((warnings, compilation) => {
        warnings.push(...compilation.warnings);
        warnings.push(...getWarnings(compilation.children));
        return warnings;
      }, [] as webpack.WebpackError[]);
    }

    return getWarnings([this.stats!.compilation]);
  }

  public get outputDir() {
    return this.fs.join(this.options.path, 'dist');
  }

  private loadWebpackConfig(rootDir = this.options.path) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(this.fs.join(rootDir, 'webpack.config')) as webpack.Configuration;
  }

  public getProjectFiles() {
    return loadDirSync(this.options.path);
  }
}
