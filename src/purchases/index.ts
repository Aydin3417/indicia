// Web and any build without store keys: test purchases (the server accepts them only in development).
import { testStore, type Store } from './types';

export * from './types';
export const store: Store = testStore;
