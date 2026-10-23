// Every practice question on the site, by id. Add a module's questions here when you write them.
import type { Generator } from './exercise';
import { module1 } from './module1';
import { module2 } from './module2';
import { module3 } from './module3';
import { module4 } from './module4';
import { module5 } from './module5';
import { module6 } from './module6';
import { module7 } from './module7';

export const exercises: Record<string, Generator> = {
  ...module1,
  ...module2,
  ...module3,
  ...module4,
  ...module5,
  ...module6,
  ...module7,
};
