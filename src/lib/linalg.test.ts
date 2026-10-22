import { describe, expect, it } from 'vitest';
import { matVec } from './linalg';

describe('matVec', () => {
  it('lands -1 i-hat + 2 j-hat where the matrix sends them', () => {
    // i-hat goes to (1, -2), j-hat goes to (3, 0).
    // -1*(1, -2) + 2*(3, 0) = (5, 2)
    expect(matVec([[1, -2], [3, 0]], [-1, 2])).toEqual([5, 2]);
  });
});
