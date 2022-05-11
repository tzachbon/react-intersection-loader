import type { ComponentType } from 'react';
import type { ComponentModule } from './types';

export function interopDefault<T extends {}>(mod: ComponentModule<T> | undefined) {
  if (mod && 'default' in mod && mod.default) {
    return mod.default;
  } else {
    return mod as ComponentType<T> | undefined;
  }
}
