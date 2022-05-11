import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './index';

if (document.body.hasAttribute('data-ssr')) {
  hydrateRoot(document.body, <></>).render(<App />);
} else {
  createRoot(document.body).render(<App />);
}
