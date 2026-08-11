import prose from './prose.txt?raw';
import typescript from './typescript.txt?raw';
import python from './python.txt?raw';
import markdown from './markdown.txt?raw';
import longform from './longform.txt?raw';

export type SampleId = 'prose' | 'typescript' | 'python' | 'markdown' | 'longform';

export interface Sample {
  readonly id: SampleId;
  readonly label: string;
  readonly description: string;
  readonly text: string;
}

export const DEFAULT_SAMPLE: Sample = {
  id: 'prose',
  label: 'Prose',
  description: 'Plain prose paragraphs — good for recursive and sentence strategies',
  text: prose,
};

export const SAMPLES: readonly Sample[] = [
  DEFAULT_SAMPLE,
  {
    id: 'typescript',
    label: 'TypeScript',
    description: 'TypeScript source code — try the recursive-javascript strategy',
    text: typescript,
  },
  {
    id: 'python',
    label: 'Python',
    description: 'Python source code — try the recursive-python strategy',
    text: python,
  },
  {
    id: 'markdown',
    label: 'Markdown',
    description: 'Structured Markdown document — try markdown-header or recursive-markdown',
    text: markdown,
  },
  {
    id: 'longform',
    label: 'Long-form',
    description: 'Long-form plain text — good for stress-testing render budget',
    text: longform,
  },
];
