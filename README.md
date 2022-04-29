# React intersection loader

Lazy load your components only when its visible.

```tsx
import { intersectionLoader } from 'react-intersection-loader';

// This is will be imported (lazy loaded) only when the user is about to see it.
const MyComponent = intersectionLoader(() => import('./MyComponent'));

export default function App() {
  return (
    <div>
      <div
        style={{
          width: '100vw',
          height: '100vh',
        }}
      >
        <h1>I am a viewport size</h1>
      </div>
      <MyComponent />
    </div>
  );
}

```

> Currently only supported with hooks

## Installation

```sh
npm i react-intersection-loader
```
or

```sh
yarn add react-intersection-loader
```
