import { Injectable } from '@angular/core';
import { GameRound, Category, Question, RoundMetadata } from './content.types';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error';
}

export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class ContentValidatorService {

  validateRoundMetadata(metadata: RoundMetadata): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields
    if (!metadata.id || typeof metadata.id !== 'string') {
      errors.push({
        field: 'id',
        message: 'Round ID is required and must be a string',
        severity: 'error'
      });
    }

    if (!metadata.name || typeof metadata.name !== 'string') {
      errors.push({
        field: 'name',
        message: 'Round name is required and must be a string',
        severity: 'error'
      });
    }

    if (!metadata.language || typeof metadata.language !== 'string') {
      errors.push({
        field: 'language',
        message: 'Language is required and must be a string',
        severity: 'error'
      });
    }

    if (!metadata.difficulty || typeof metadata.difficulty !== 'string') {
      errors.push({
        field: 'difficulty',
        message: 'Difficulty is required and must be a string',
        severity: 'error'
      });
    }

    // Validate difficulty values
    const validDifficulties = ['easy', 'medium', 'hard', 'mixed'];
    if (metadata.difficulty && !validDifficulties.includes(metadata.difficulty)) {
      warnings.push({
        field: 'difficulty',
        message: `Difficulty should be one of: ${validDifficulties.join(', ')}`,
        severity: 'warning'
      });
    }

    // Validate language codes (basic check)
    const validLanguages = ['en', 'de', 'fr', 'es', 'it'];
    if (metadata.language && !validLanguages.includes(metadata.language)) {
      warnings.push({
        field: 'language',
        message: `Language should be one of: ${validLanguages.join(', ')}`,
        severity: 'warning'
      });
    }

    // Validate categories array (optional)
    if (metadata.categories !== undefined && !Array.isArray(metadata.categories)) {
      errors.push({
        field: 'categories',
        message: 'Categories must be an array if provided',
        severity: 'error'
      });
    } else if (metadata.categories && metadata.categories.length === 0) {
      warnings.push({
        field: 'categories',
        message: 'Round should have at least one category',
        severity: 'warning'
      });
    }

    // Validate size estimate
    if (typeof metadata.size !== 'number' || metadata.size < 0) {
      warnings.push({
        field: 'size',
        message: 'Size should be a positive number representing bytes',
        severity: 'warning'
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  validateGameRound(round: GameRound): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields
    if (!round.name || typeof round.name !== 'string') {
      errors.push({
        field: 'name',
        message: 'Round name is required and must be a string',
        severity: 'error'
      });
    }

    if (!Array.isArray(round.categories)) {
      errors.push({
        field: 'categories',
        message: 'Categories must be an array of category names',
        severity: 'error'
      });
    } else if (round.categories.length === 0) {
      errors.push({
        field: 'categories',
        message: 'Round must have at least one category',
        severity: 'error'
      });
    }

    // Validate category names
    if (round.categories) {
      round.categories.forEach((categoryName, index) => {
        if (typeof categoryName !== 'string' || categoryName.trim() === '') {
          errors.push({
            field: `categories[${index}]`,
            message: 'Category names must be non-empty strings',
            severity: 'error'
          });
        }
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  validateCategory(category: Category): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields
    if (!category.name || typeof category.name !== 'string') {
      errors.push({
        field: 'name',
        message: 'Category name is required and must be a string',
        severity: 'error'
      });
    }

    if (!Array.isArray(category.questions)) {
      errors.push({
        field: 'questions',
        message: 'Questions must be an array',
        severity: 'error'
      });
    } else if (category.questions.length === 0) {
      warnings.push({
        field: 'questions',
        message: 'Category should have at least one question',
        severity: 'warning'
      });
    } else {
      // Validate each question
      category.questions.forEach((question, index) => {
        const questionValidation = this.validateQuestion(question, index);
        errors.push(...questionValidation.errors);
        warnings.push(...questionValidation.warnings);
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  validateQuestion(question: Question, index: number): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const prefix = `questions[${index}]`;

    // Required fields
    if (!question.question || typeof question.question !== 'string') {
      errors.push({
        field: `${prefix}.question`,
        message: 'Question text is required and must be a string',
        severity: 'error'
      });
    }

    // Either answer or image must be present
    const hasAnswer = question.answer && typeof question.answer === 'string';
    const hasImage = question.image && typeof question.image === 'string';

    if (!hasAnswer && !hasImage) {
      errors.push({
        field: `${prefix}`,
        message: 'Question must have either an answer or an image',
        severity: 'error'
      });
    }

    if (hasAnswer && hasImage) {
      warnings.push({
        field: `${prefix}`,
        message: 'Question has both answer and image - typically only one is used',
        severity: 'warning'
      });
    }

    // Validate question state
    if (typeof question.available !== 'boolean') {
      errors.push({
        field: `${prefix}.available`,
        message: 'Available flag must be a boolean',
        severity: 'error'
      });
    }

    if (typeof question.value !== 'number' || question.value <= 0) {
      errors.push({
        field: `${prefix}.value`,
        message: 'Question value must be a positive number',
        severity: 'error'
      });
    }

    if (!question.cat || typeof question.cat !== 'string') {
      errors.push({
        field: `${prefix}.cat`,
        message: 'Category reference is required and must be a string',
        severity: 'error'
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  validateCompleteRound(round: GameRound, categories: Category[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate round structure
    const roundValidation = this.validateGameRound(round);
    errors.push(...roundValidation.errors);
    warnings.push(...roundValidation.warnings);

    // Validate category count matches
    if (round.categories && categories.length !== round.categories.length) {
      errors.push({
        field: 'categories',
        message: `Round declares ${round.categories.length} categories but ${categories.length} were loaded`,
        severity: 'error'
      });
    }

    // Validate each category
    categories.forEach((category, index) => {
      const categoryValidation = this.validateCategory(category);
      errors.push(...categoryValidation.errors.map(error => ({
        ...error,
        field: `category[${index}].${error.field}`
      })));
      warnings.push(...categoryValidation.warnings.map(warning => ({
        ...warning,
        field: `category[${index}].${warning.field}`
      })));
    });

    return { isValid: errors.length === 0, errors, warnings };
  }

  // Utility method to get human-readable error summary
  getErrorSummary(result: ValidationResult): string {
    if (result.isValid) return 'Content is valid';

    const errorCount = result.errors.length;
    const warningCount = result.warnings.length;

    let summary = `${errorCount} error${errorCount !== 1 ? 's' : ''}`;
    if (warningCount > 0) {
      summary += `, ${warningCount} warning${warningCount !== 1 ? 's' : ''}`;
    }
    summary += ' found';

    return summary;
  }
}