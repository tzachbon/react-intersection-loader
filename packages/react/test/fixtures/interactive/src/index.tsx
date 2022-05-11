import { FC, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { intersectionLoader } from 'react-intersection-loader';

const LazyComponent = intersectionLoader(() => import(/* webpackChunkName: "lazy" */ './lazy'));

const App: FC = () => {
  const [title, setTitle] = useState<string>('');

  return (
    <>
      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: 'blue',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <input type="text" onInput={({ target }) => setTitle((target as HTMLInputElement).value)} />
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
      <LazyComponent title={title} />
    </>
  );
};

createRoot(document.body).render(<App />);
