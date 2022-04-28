import { ComponentType, memo, useRef, useState, useInsertionEffect } from 'react';

type ComponentModule<T extends {}> = { default: ComponentType<T> } | ComponentType<T>;

function interopDefault<T extends {}>(mod: ComponentModule<T> | undefined) {
  if (mod && 'default' in mod && mod.default) {
    return mod.default;
  }

  return mod as ComponentType<T> | undefined;
}

interface InteractionLoaderOptions<T extends {}> {
  load: () => Promise<{ default: ComponentType<T> }>;
  intersectionObserverOptions?: IntersectionObserverInit;
}

export function intersectionLoader<T extends {}>({
  load,
  intersectionObserverOptions,
}: InteractionLoaderOptions<T>): ComponentType<T> {
  return memo(function (props: T) {
    const root = useRef<HTMLDivElement>(null);
    const [component, setState] = useState(
      <div dangerouslySetInnerHTML={{ __html: '' }} suppressHydrationWarning ref={root}></div>
    );

    useInsertionEffect(() => {
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

            setState(<Component {...props} />);
          }
        },
        { threshold: 0.1, ...intersectionObserverOptions }
      );

      observer.observe(root.current!);

      return () => {
        observer.disconnect();
      };
    }, []);

    return component;
  });
}
