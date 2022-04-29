import { ComponentType, useCallback, useLayoutEffect, useRef, useState, lazy, Suspense, ReactNode } from 'react';

export type ComponentModule<T extends {}> = { default: ComponentType<T> } | ComponentType<T>;

export interface InteractionLoaderOptions {
  /**
   * Intersection observer options.\
   * https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver#parameters
   */
  intersectionObserverOptions?: IntersectionObserverInit;
  /**
   * Renders the component regardless of the element is visible or not.
   * This uses `React.lazy`
   */
  force?: boolean;
  /**
   * Only when using `force` this is the fallback react node that will be used in the Suspense.
   */
  fallback?: ReactNode;
}

/**
 *
 * @param load   /**
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
 * async () => (await import('./MyComponent')).MyComponent
 *
 * @param options {InteractionLoaderOptions} Interaction loader options.
 */
export function intersectionLoader<T extends {}>(
  load: () => Promise<ComponentModule<T>>,
  { intersectionObserverOptions, force, fallback }: InteractionLoaderOptions = {}
): ComponentType<T> {
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

    const forceLoadComponent = useCallback(() => {
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
    }, []);

    useLayoutEffect(() => {
      if (force) {
        forceLoadComponent();
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
        {
          threshold: 0.1,
          rootMargin: '250px',
          ...intersectionObserverOptions,
        }
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
