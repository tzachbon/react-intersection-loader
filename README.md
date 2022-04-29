# React intersection loader

Lazy load your components only when its visible.

![react-intersection-loader-demo](./react-intersection-loader.gif)

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

## Examples

Testing is a top priority. Therefore I created fixtures with various use-cases of projects that use this library.
You can check it out [here](./packages/react-intersection-loader/test/fixtures/).\
\
I build the fixtures using [webpack](https://webpack.js.org/), serve them and test them with [playwright](https://playwright.dev/).



## Installation

```sh
npm i react-intersection-loader
```
or

```sh
yarn add react-intersection-loader
```
