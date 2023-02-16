// @flow
const {describe, it} = global;
import expect from 'expect';
import {convertFromRaw} from 'draft-js';
import stateToMarkdown from '../stateToMarkdown';
import fs from 'fs';
import {join} from 'path';

// This separates the test cases in `data/test-cases.txt`.
const SEP = '\n\n>>';

let testCasesRaw = fs.readFileSync(
  join(__dirname, '..', '..', 'test', 'test-cases.txt'),
  'utf8',
);

let testCases = testCasesRaw
  .slice(2)
  .trim()
  .split(SEP)
  .map((text) => {
    let lines = text.split('\n');
    let [description, config] = lines.shift().split('|');
    description = description.trim();
    let options = config ? JSON.parse(config.trim()) : undefined;
    let state = JSON.parse(lines.shift());
    let markdown = lines.join('\n');
    return {description, state, markdown, options};
  });

describe('stateToMarkdown', () => {
  testCases.forEach((testCase) => {
    let {description, state, markdown, options} = testCase;
    it(`should render ${description}`, () => {
      let contentState = convertFromRaw(state);
      expect(stateToMarkdown(contentState, options)).toBe(markdown + '\n');
    });
  });

  it(`should render leading spaces in a block as non-breaking`, () => {
    const state = {
      entityMap: {},
      blocks: [
        {key: '99n0j', text: '    asd f', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: []},
        {key: '88f0j', text: '    hello', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: []}
      ],
    };
    let contentState = convertFromRaw(state);
    const expected = `\xa0\xa0\xa0\xa0asd f\n\n\xa0\xa0\xa0\xa0hello\n`;
    expect(stateToMarkdown(contentState)).toBe(expected);
  });
});
