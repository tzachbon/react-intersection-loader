/* eslint-disable no-console */
import express from 'express';
import { createListeningHttpServer } from 'create-listening-server';
import { join, dirname } from 'path';
import { renderToString } from 'react-dom/server';
import { App } from '.';

const [preferredPort] = process.argv.slice(2);
const port = Number(preferredPort || 8080);

const app = express();

app.use(
  express.static(join(__dirname), {
    index: false,
    cacheControl: false,
    etag: false,
    immutable: false,
    lastModified: false,
  })
);

app.use('/react', express.static(dirname(require.resolve('react/package.json')))); // Expose react package
app.use('/react-dom', express.static(dirname(require.resolve('react-dom/package.json')))); // Expose react-dom package

app.use('*', (_req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My App!</title>
    <script src="react/umd/react.development.js"></script>
    <script src="react-dom/umd/react-dom.development.js"></script>
    <script defer src="main.js"></script>
  </head>
  <body data-ssr>
    ${renderToString(<App />)}
  </body>
  </html>
  `);
});

createListeningHttpServer(port, app)
  .then(() => {
    process.send?.({ port });
    console.log(`Listening on port ${port}`);
  })
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
