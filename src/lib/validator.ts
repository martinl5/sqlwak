import { executeQuery } from './db';
import type { QueryResult } from '@/types';

export interface ValidationResult {
  success: boolean;
  message: string;
  userResult?: QueryResult;
  expectedResult?: QueryResult;
}

export function validateQuery(userQuery: string, solutionQuery: string): ValidationResult {
  try {
    // Execute user's query
    const userResult = executeQuery(userQuery);

    // Execute solution query
    const expectedResult = executeQuery(solutionQuery);

    // Compare results
    const isValid = compareResults(userResult, expectedResult);

    if (isValid) {
      return {
        success: true,
        message: 'Query executed successfully! A new bird has joined your flock!',
        userResult,
        expectedResult,
      };
    } else {
      return {
        success: false,
        message: 'Your query returned different results than expected. Check your WHERE conditions and filters.',
        userResult,
        expectedResult,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Query execution failed',
    };
  }
}

function compareResults(user: QueryResult, expected: QueryResult): boolean {
  // Check column count
  if (user.columns.length !== expected.columns.length) {
    return false;
  }

  // Check row count
  if (user.values.length !== expected.values.length) {
    return false;
  }

  // Check if columns match (order matters for simplicity)
  for (let i = 0; i < user.columns.length; i++) {
    if (user.columns[i] !== expected.columns[i]) {
      return false;
    }
  }

  // Check values (allow for minor floating point differences)
  for (let row = 0; row < user.values.length; row++) {
    for (let col = 0; col < user.values[row].length; col++) {
      const userVal = user.values[row][col];
      const expectedVal = expected.values[row][col];

      if (!valuesEqual(userVal, expectedVal)) {
        return false;
      }
    }
  }

  return true;
}

function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (typeof a === 'number' && typeof b === 'number') {
    return Math.abs(a - b) < 0.0001;
  }
  if (typeof a === 'string' && typeof b === 'string') {
    return a.toLowerCase().trim() === b.toLowerCase().trim();
  }
  return false;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}
