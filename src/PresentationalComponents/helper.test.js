import { sortTopics } from './helper';
import fixtures from '../../cypress/fixtures/topics.json';

describe('sortTopics test', () => {
  const indexes = [0, 2, 3];
  const directions = ['asc', 'desc'];
  test('the function is called with the Name column parameter and direction asc', () => {
    let sortResult = sortTopics(fixtures, indexes[0], directions[1]);

    expect(sortResult[0].description).toBe('ABZ');
  });
  test('the function is called with the Name column parameter and direction desc', () => {
    let sortResult = sortTopics(fixtures, indexes[0], directions[0]);

    expect(sortResult[0].description).toBe('TEST');
  });
  test('the function is called with the Featured column parameter and direction asc', () => {
    let sortResult = sortTopics(fixtures, indexes[1], directions[1]);

    expect(sortResult[0].featured).toBe(true);
  });
  test('the function is called with the Featured column parameter and direction desc', () => {
    let sortResult = sortTopics(fixtures, indexes[1], directions[0]);

    expect(sortResult[0].featured).toBe(false);
  });
  test('the function is called with the Impacted systems column parameter and direction asc', () => {
    let sortResult = sortTopics(fixtures, indexes[2], directions[1]);

    expect(sortResult[0].impacted_systems_count).toBe(694);
  });
  test('the function is called with the Impacted systems column parameter and direction desc', () => {
    let sortResult = sortTopics(fixtures, indexes[2], directions[0]);

    expect(sortResult[0].impacted_systems_count).toBe(0);
  });
});
