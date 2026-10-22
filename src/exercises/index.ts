// Every practice question on the site, by id. Add a module's questions here when you write them.
import type { Generator } from './exercise';
import { module1 } from './module1';

export const exercises: Record<string, Generator> = {
  ...module1,
};
