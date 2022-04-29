import { FC, ReactNode, Suspense } from 'react';

export const WithSuspense: FC<{ fallback: ReactNode; use?: boolean; children: ReactNode }> = ({
  fallback,
  children,
  use,
}) => {
  if (use) {
    return <Suspense fallback={fallback}>{children}</Suspense>;
  } else {
    return <>{children}</>;
  }
};
