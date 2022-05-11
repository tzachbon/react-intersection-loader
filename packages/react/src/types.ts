import type { ComponentType } from 'react';

export type ComponentModule<T extends {}> = { default: ComponentType<T> } | ComponentType<T>;
