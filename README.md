# React Intersection Loader

Lazy load your components only when they're visible.

[![release](https://badgen.net/github/release/tzachbon/react-intersection-loader)](https://github.com/tzachbon/react-intersection-loader/releases)
[![checks](https://badgen.net/github/checks/tzachbon/react-intersection-loader)](https://github.com/tzachbon/react-intersection-loader/actions)
[![version](https://badgen.net/npm/v/react-intersection-loader)](https://www.npmjs.com/package/react-intersection-loader)

![react-intersection-loader-demo](https://github.com/tzachbon/react-intersection-loader/blob/master/react-intersection-loader.gif?raw=true)

```tsx
import { intersectionLoader } from 'react-intersection-loader';

// This will be imported (lazy loaded) only when the user is about to see it.
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

### Support

Since this uses react, support verity of use cases is a most.
#### React

Currently only supported with hooks, react `>=16.8.0`

#### SSR (Server-side rendering)

Full support of SSR and hydration!

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
