import { intersectionLoader } from 'react-intersection-loader';

declare const __non_webpack_require__: NodeRequire;

const isSSR = typeof __non_webpack_require__ !== 'undefined';
const originalRequire = isSSR ? __non_webpack_require__ : () => void 0;

const LazyComponent = intersectionLoader(
  () => (isSSR ? (originalRequire('./lazy') as typeof import('./lazy')) : import('./lazy')),
  { force: isSSR }
);

export const App = () => {
  return (
    <>
      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: 'blue',
        }}
      >
        <h1>I am a page size</h1>
      </div>
      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: 'red',
        }}
      >
        <h1>I am a page size</h1>
      </div>
      <LazyComponent />
    </>
  );
};
