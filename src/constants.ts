import type { RecordItem } from './types';

export const DATE_FORMAT = 'DD.MM.YYYY';
export const ISO_DATE_FORMAT = 'YYYY-MM-DD';

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 100;
export const MIN_VALUE = 0;
export const MAX_VALUE = 1_000_000;

export const SEARCH_PLACEHOLDER = 'Поиск по имени, дате или числу';

export const INITIAL_RECORDS: RecordItem[] = [
  { id: 'rec-1', name: 'Alpha Logistics', date: '2026-03-19', value: 1200 },
  { id: 'rec-2', name: 'Beta Retail', date: '2026-01-08', value: 45000 },
  { id: 'rec-3', name: 'Gamma Support', date: '2025-12-14', value: 320 },
  { id: 'rec-4', name: 'Delta 12 Systems', date: '2026-07-01', value: 120345 },
];

export const VALIDATION_MESSAGES = {
  nameRequired: 'Введите имя',
  nameWhitespace: 'Имя не может состоять только из пробелов',
  nameLength: `Имя должно содержать от ${NAME_MIN_LENGTH} до ${NAME_MAX_LENGTH} символов`,
  dateRequired: 'Выберите дату',
  valueRequired: 'Введите числовое значение',
  valueRange: `Значение должно быть в диапазоне от ${MIN_VALUE} до ${MAX_VALUE}`,
};
