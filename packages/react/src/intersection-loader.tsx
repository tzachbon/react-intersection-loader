import {
  AllHTMLAttributes,
  ComponentType,
  lazy,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { LoaderError } from './error';
import { interopDefault } from './interop-default';
import type { ComponentModule } from './types';
import { WithSuspense } from './with-suspense';

const useIsomorphicLayoutEffect = typeof document !== 'undefined' ? useLayoutEffect : useEffect;

export interface InteractionLoaderOptions {
  /**
   * Intersection observer options.\
   * https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver#parameters
   *
   * @default
   * - rootMargin: '250px'
   * - threshold: 0.1
   *
   */
  intersectionObserverOptions?: IntersectionObserverInit;
  /**
   * Renders the component regardless of the element is visible or not.
   * This uses `React.lazy`
   *
   * @default false
   */
  force?: boolean;
  /**
   * Should warp the component with `React.Suspense`
   *
   * @default true
   */
  suspense?: boolean;
  /**
   * Only when using `suspense` or `force` this is the fallback react node that will be used in the Suspense.
   */
  fallback?: ReactNode;
  /**
   * Placeholder element props, used when the element is not visible (Setting the dimensions for example).
   */
  placeholderProps?: AllHTMLAttributes<HTMLElement>;
}

/**
 *
 * @param load Function that must call a dynamic import().\
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
  load: () => Promise<ComponentModule<T>> | ComponentModule<T>,
  { intersectionObserverOptions, force, fallback, placeholderProps, suspense = true }: InteractionLoaderOptions = {}
): ComponentType<T> {
  return function (props: T) {
    const root = useRef<HTMLDivElement>(null);
    const [, setForceUpdate] = useState<boolean>();
    const Component = useRef<ComponentType<T>>();

    const loadComponent = useCallback(async () => {
      const component = interopDefault(await load());

      if (!component) {
        setForceUpdate(() => {
          throw new LoaderError('Component is not defined');
        });
        return;
      }

      Component.current = component;
      setForceUpdate((f) => !f);
    }, []);

    useIsomorphicLayoutEffect(() => {
      if (!('IntersectionObserver' in window)) {
        throw new LoaderError('Intersection observer is not supported');
      }

      if (!root.current) {
        return;
      }

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

      observer.observe(root.current);

      return () => {
        observer?.disconnect();
      };
    }, []);

    if (force) {
      const loaded = load();

      if (isPromise(loaded)) {
        Component.current ??= lazy(() =>
          loaded.then((mod) => ({
            default: interopDefault(mod) as ComponentType<unknown>,
          }))
        );
      } else {
        Component.current ??= interopDefault(loaded);
      }
    }

    return Component.current !== undefined ? (
      <WithSuspense use={force || suspense} fallback={fallback}>
        <Component.current {...props} />
      </WithSuspense>
    ) : (
      <div {...placeholderProps} dangerouslySetInnerHTML={{ __html: '' }} suppressHydrationWarning ref={root} />
    );
  };
}

function isPromise<T>(obj: unknown): obj is Promise<T> {
  return (
    Boolean(obj) &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof (obj as { then?: unknown }).then === 'function'
  );
}
