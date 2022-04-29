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
    const [, setForceUpdate] = useState<boolean>();
    const Component = useRef<ComponentType<T>>();

    const loadComponent = useCallback(async () => {
      const component = interopDefault(await load());

      if (!component) {
        setForceUpdate(() => {
          throw new Error('Component is not defined');
        });
        return;
      }

      Component.current = component;
      setForceUpdate((f) => !f);
    }, []);

    useLayoutEffect(() => {
      if (force) {
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

    if (force) {
      Component.current ??= lazy(() =>
        load().then((mod) => ({
          default: interopDefault(mod) as ComponentType<unknown>,
        }))
      );
    }

    return Component.current !== undefined ? (
      <WithSuspense use={force} fallback={fallback}>
        <Component.current {...props} />
      </WithSuspense>
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

function WithSuspense({ fallback, children, use }: { fallback: ReactNode; use?: boolean; children: ReactNode }) {
  if (use) {
    return <Suspense fallback={fallback}>{children}</Suspense>;
  } else {
    return <>{children}</>;
  }
}
