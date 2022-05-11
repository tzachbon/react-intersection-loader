import { intersectionLoader } from 'react-intersection-loader';

const LazyComponent = intersectionLoader(() => import('./lazy'));

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
