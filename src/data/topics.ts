import type { Topic } from '../types';

export const topics: Topic[] = [
  {
    id: 'algebra-ii-quadratics',
    subject: 'Algebra II',
    title: 'Quadratics',
    summary: 'Factor, complete the square, use the quadratic formula, and read vertex form.',
    difficulties: ['easy', 'medium', 'hard'],
    subtopics: [
      {
        id: 'completing-the-square',
        title: 'Completing the Square',
        summary: 'Rewrite quadratic expressions to reveal their vertex and roots.',
        questionIds: ['q-quad-1', 'q-quad-2'],
      },
      {
        id: 'quadratic-formula',
        title: 'Quadratic Formula',
        summary: 'Solve quadratic equations using discriminants and exact roots.',
        questionIds: ['q-quad-3', 'q-quad-4'],
      },
    ],
  },
  {
    id: 'geometry-triangles',
    subject: 'Geometry',
    title: 'Triangles',
    summary: 'Use similarity, congruence, angles, and right triangle relationships.',
    difficulties: ['easy', 'medium', 'hard'],
    subtopics: [
      {
        id: 'right-triangles',
        title: 'Right Triangles',
        summary: 'Apply the Pythagorean theorem and special right triangle ratios.',
        questionIds: ['q-geo-1', 'q-geo-2'],
      },
    ],
  },
  {
    id: 'precalc-functions',
    subject: 'Precalc',
    title: 'Functions',
    summary: 'Analyze notation, composition, transformations, and inverse functions.',
    difficulties: ['easy', 'medium', 'hard'],
    subtopics: [
      {
        id: 'function-composition',
        title: 'Function Composition',
        summary: 'Evaluate and interpret nested function expressions.',
        questionIds: ['q-func-1', 'q-func-2'],
      },
    ],
  },
  {
    id: 'stats-probability',
    subject: 'Stats',
    title: 'Probability',
    summary: 'Work with compound events, conditional probability, and expected value.',
    difficulties: ['easy', 'medium', 'hard'],
    subtopics: [
      {
        id: 'conditional-probability',
        title: 'Conditional Probability',
        summary: 'Use ratios and two-way tables to reason about given information.',
        questionIds: ['q-stat-1', 'q-stat-2'],
      },
    ],
  },
  {
    id: 'ap-calc-derivatives',
    subject: 'AP Calc',
    title: 'Derivatives',
    summary: 'Estimate, compute, and interpret rates of change.',
    difficulties: ['easy', 'medium', 'hard'],
    subtopics: [
      {
        id: 'power-rule',
        title: 'Power Rule',
        summary: 'Differentiate polynomial and power functions efficiently.',
        questionIds: ['q-calc-1', 'q-calc-2'],
      },
    ],
  },
];

export const getTopicById = (topicId: string): Topic | undefined =>
  topics.find((topic) => topic.id === topicId);
