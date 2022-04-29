import { createRoot } from 'react-dom/client';
import { intersectionLoader } from 'react-intersection-loader';

const LazyComponent = intersectionLoader(() => import('./lazy'));

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
    <LazyComponent />
  </>
);
