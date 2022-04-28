import { ComponentType, useLayoutEffect, useRef, useState } from 'react';

export type ComponentModule<T extends {}> = { default: ComponentType<T> } | ComponentType<T>;

export interface InteractionLoaderOptions<T extends {}> {
  load: () => Promise<ComponentModule<T>>;
  intersectionObserverOptions?: IntersectionObserverInit;
}

export function intersectionLoader<T extends {}>({
  load,
  intersectionObserverOptions,
}: InteractionLoaderOptions<T>): ComponentType<T> {
  return function (props: T) {
    const root = useRef<HTMLDivElement>(null);
    const [Component, setState] = useState<ComponentType<T>>();

    useLayoutEffect(() => {
      const observer = new IntersectionObserver(
        async (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) {
              return;
            }

            observer.disconnect();

            const Component = interopDefault(await load());

            if (!Component) {
              setState(() => {
                throw new Error('Component is not defined');
              });
              return;
            }

            setState(Component);
          }
        },
        { threshold: 0.1, ...intersectionObserverOptions }
      );

      observer.observe(root.current!);

      return () => {
        observer.disconnect();
      };
    }, []);

    return Component ? (
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
