import { HttpErrorResponse } from '@angular/common/http';

type ApiErrorPayload = {
  message?: string;
  validationErrors?: string[];
};

const messageMap: Record<string, string> = {
  'Category name already exists': 'Ce nom de categorie existe deja.',
  'Category is used by transactions': 'Impossible de supprimer : categorie utilisee par des transactions.',
  'Category not found': 'Categorie introuvable.',
  'Transaction not found': 'Transaction introuvable.',
  'Goal not found': 'Objectif introuvable.',
  'Validation failed': 'Validation impossible.',
  'Start date is required': 'La date de debut est obligatoire.',
  'End date must be after start date': 'La date de fin doit etre apres la date de debut.'
};

const defaultMessage = 'Une erreur est survenue.';

export function extractErrorMessage(error: unknown, fallbackMessage: string = defaultMessage): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'Serveur indisponible.';
    }
    const payload = error.error as ApiErrorPayload | string | null | undefined;
    if (payload) {
      if (typeof payload === 'string') {
        return mapMessage(payload);
      }
      if (payload.message) {
        return mapMessage(payload.message);
      }
      if (payload.validationErrors?.length) {
        return payload.validationErrors.map(mapMessage).join(' | ');
      }
    }
    if (error.message) {
      return mapMessage(error.message);
    }
  }

  if (typeof error === 'string') {
    return mapMessage(error);
  }

  return fallbackMessage;
}

function mapMessage(message: string): string {
  const trimmed = message.trim();
  return messageMap[trimmed] ?? trimmed;
}
