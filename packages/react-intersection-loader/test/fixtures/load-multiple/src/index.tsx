import { createRoot } from 'react-dom/client';
import { intersectionLoader } from 'react-intersection-loader';

const LazyOne = intersectionLoader(() => import(/* webpackChunkName: "lazy-one" */ './lazy-one'), {
  placeholderProps: { style: { height: '100vh', width: '100vw', background: 'salmon' } },
});
const LazyTwo = intersectionLoader(() => import(/* webpackChunkName: "lazy-two" */ './lazy-two'));

createRoot(document.body).render(
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
    <LazyOne />
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'green',
      }}
    >
      <h1>I am a page size</h1>
    </div>
    <LazyTwo />
  </>
);
