export class LoaderError extends Error {
  constructor(public readonly message: string) {
    super(`React Intersection Loader: ${message}`);
  }
}
