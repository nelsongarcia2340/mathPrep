# MathPrep

MathPrep is a client-only high school math prep app built with React 18, TypeScript, Vite, Tailwind CSS, React Router, Zustand, KaTeX, and Recharts.

## Getting Started

```bash
pnpm install
pnpm dev
```

Useful scripts:

```bash
pnpm build
pnpm lint
pnpm preview
```

## Project Structure

```text
src/
  components/  reusable UI components
  data/        topic definitions and question banks
  pages/       route-level views
  store/       Zustand stores with localStorage persistence
  types/       shared TypeScript interfaces
  utils/       adaptive difficulty, scoring, math rendering helpers
```

## Current Build Checkpoint

The first reviewable slice includes:

- Vite + React + TypeScript + Tailwind setup
- Responsive app shell and navigation
- Onboarding flow with grade/course selection
- 8-question diagnostic quiz rendered with KaTeX
- Zustand progress store persisted to localStorage
- Seeded topic/question data shape for the rest of v1

Practice mode, timed tests, progress charts, and the fully wired mistake journal are next.

## Adding Topics

Add a topic in `src/data/topics.ts`:

```ts
{
  id: 'algebra-ii-polynomials',
  subject: 'Algebra II',
  title: 'Polynomials',
  summary: 'Factor, divide, and analyze polynomial expressions.',
  difficulties: ['easy', 'medium', 'hard'],
  subtopics: [
    {
      id: 'factoring-polynomials',
      title: 'Factoring Polynomials',
      summary: 'Break expressions into useful factors.',
      questionIds: ['q-poly-1']
    }
  ]
}
```

Then add matching questions in `src/data/questions.ts`. Use `$...$` for inline math notation.

## Persistence

MathPrep v1 has no backend. User profile, diagnostic results, XP, topic progress, and mistakes are stored in browser localStorage under `mathprep-progress`.
