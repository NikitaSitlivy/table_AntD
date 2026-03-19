import type { RecordItem } from './types';

export const DATE_FORMAT = 'DD.MM.YYYY';
export const ISO_DATE_FORMAT = 'YYYY-MM-DD';

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 100;
export const MAX_VALUE_DIGITS = 15;

export const SEARCH_PLACEHOLDER = 'Поиск по имени, дате или числу';
export const RECORDS_STORAGE_KEY = 'crud-table-records';

export const INITIAL_RECORDS: RecordItem[] = [
  { id: 'rec-1', name: 'Alpha Logistics', date: '2026-03-19', value: 1200 },
  { id: 'rec-2', name: 'Beta Retail', date: '2026-01-08', value: 45000 },
  { id: 'rec-3', name: 'Gamma Support', date: '2025-12-14', value: 320 },
  { id: 'rec-4', name: 'Delta 12 Systems', date: '2026-07-01', value: 120345 },
];

export const VALIDATION_MESSAGES = {
  nameRequired: 'Введите имя',
  nameLength: `Имя должно содержать от ${NAME_MIN_LENGTH} до ${NAME_MAX_LENGTH} символов`,
  dateRequired: 'Выберите дату',
  dateInvalid: 'Введите корректную дату в формате ДД.ММ.ГГГГ',
  valueRequired: 'Введите числовое значение',
  valueDigits: `Числовое значение должно содержать не более ${MAX_VALUE_DIGITS} цифр`,
};
