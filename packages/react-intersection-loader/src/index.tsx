import { ComponentType, useCallback, useLayoutEffect, useRef, useState, lazy, Suspense, ReactNode } from 'react';

export type ComponentModule<T extends {}> = { default: ComponentType<T> } | ComponentType<T>;

export interface InteractionLoaderOptions<T extends {}> {
  /**
   * Function that must call a dynamic import().\
   * This must return a Promise which resolves to a module with a React component (it could be default export).
   *
   * @example
   *
   * // It has default import
   * () => import('./MyComponent')
   *
   * @example
   *
   * // Directly return a module with a component
   * () => import('./MyComponent').MyComponent
   */
  load: () => Promise<ComponentModule<T>>;
  /**
   * Intersection observer options.\
   * https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver#parameters
   */
  intersectionObserverOptions?: IntersectionObserverInit;
  /**
   * The component to render when the element is not visible.
   * This uses `React.lazy`
   */
  force?: boolean;
  /**
   * Only when using `force` this is the fallback react node that will be used in the Suspense.
   */
  fallback?: ReactNode;
}

export function intersectionLoader<T extends {}>({
  load,
  intersectionObserverOptions,
  force,
  fallback,
}: InteractionLoaderOptions<T>): ComponentType<T> {
  return function (props: T) {
    const root = useRef<HTMLDivElement>(null);
    const [Component, setComponent] = useState<ComponentType<T>>();

    const loadComponent = useCallback(async () => {
      const component = interopDefault(await load());

      if (!component) {
        setComponent(() => {
          throw new Error('Component is not defined');
        });
        return;
      }

      setComponent(() => component);
    }, []);

    useLayoutEffect(() => {
      if (force) {
        setComponent(() => {
          const LazyComponent = lazy(() =>
            load().then((mod) => ({
              default: interopDefault(mod) as ComponentType<any>,
            }))
          );

          return (props: T) => (
            <Suspense fallback={fallback}>
              <LazyComponent {...props} />
            </Suspense>
          );
        });
        return;
      }

      const observer = new IntersectionObserver(
        async (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) {
              return;
            }

            observer.disconnect();
            await loadComponent();
          }
        },
        { threshold: 0.1, ...intersectionObserverOptions }
      );

      observer.observe(root.current!);

      return () => {
        observer?.disconnect();
      };
    }, []);

    return Component !== undefined ? (
      <Component {...props} />
    ) : (
      <div dangerouslySetInnerHTML={{ __html: '' }} suppressHydrationWarning ref={root}></div>
    );
  };
}

function interopDefault<T extends {}>(mod: ComponentModule<T> | undefined) {
  if (mod && 'default' in mod && mod.default) {
    return mod.default;
  }

  return mod as ComponentType<T> | undefined;
}
