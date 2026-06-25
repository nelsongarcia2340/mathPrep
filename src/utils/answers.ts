import type { Question } from '../types';

export const stringifyCorrectAnswer = (question: Question): string =>
  String(question.correctAnswer);

export const isAnswerCorrect = (question: Question, selectedAnswer: string): boolean => {
  if (question.type === 'multiple-choice') {
    return selectedAnswer === question.correctAnswer;
  }

  const numericAnswer = Number(selectedAnswer);

  if (!Number.isFinite(numericAnswer)) {
    return false;
  }

  const tolerance = question.tolerance ?? 0.001;
  return Math.abs(numericAnswer - question.correctAnswer) <= tolerance;
};
