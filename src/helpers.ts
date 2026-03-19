import dayjs from 'dayjs';
import { DATE_FORMAT, ISO_DATE_FORMAT, MAX_VALUE_DIGITS } from './constants';
import type { RecordItem } from './types';

export const formatDisplayDate = (value: string) => dayjs(value).format(DATE_FORMAT);

export const numberFormatter = new Intl.NumberFormat('ru-RU');

export const normalizeSearchValue = (value: string) => value.trim().toLocaleLowerCase();

export const buildSearchableText = (record: RecordItem) =>
  [record.name, formatDisplayDate(record.date), String(record.value)].join(' ').toLocaleLowerCase();

export const filterRecords = (records: RecordItem[], searchValue: string) => {
  const query = normalizeSearchValue(searchValue);

  if (!query) {
    return records;
  }

  return records.filter((record) => buildSearchableText(record).includes(query));
};

const normalizeNameForSort = (value: string) => {
  const trimmedValue = value.trim();
  const sanitizedValue = trimmedValue.replace(/^[^\p{L}\p{N}]+/u, '');

  return sanitizedValue || trimmedValue;
};

export const compareByName = (left: RecordItem, right: RecordItem) =>
  normalizeNameForSort(left.name).localeCompare(normalizeNameForSort(right.name), 'ru', {
    sensitivity: 'base',
    numeric: true,
  });

export const compareByDate = (left: RecordItem, right: RecordItem) =>
  dayjs(left.date).valueOf() - dayjs(right.date).valueOf();

export const compareByValue = (left: RecordItem, right: RecordItem) => left.value - right.value;

const isRecordItem = (value: unknown): value is RecordItem => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Partial<RecordItem>;
  const hasValidId = typeof record.id === 'string' && record.id.trim().length > 0;
  const hasValidName = typeof record.name === 'string' && record.name.trim().length > 0;
  const hasValidDate =
    typeof record.date === 'string' && dayjs(record.date, ISO_DATE_FORMAT, true).isValid();
  const hasValidValue =
    typeof record.value === 'number' &&
    Number.isInteger(record.value) &&
    record.value >= 0 &&
    record.value.toString().length <= MAX_VALUE_DIGITS;

  return hasValidId && hasValidName && hasValidDate && hasValidValue;
};

export const parseStoredRecords = (value: string | null, fallback: RecordItem[]) => {
  if (!value) {
    return fallback;
  }

  try {
    const parsedRecords = JSON.parse(value) as unknown;

    if (!Array.isArray(parsedRecords)) {
      return fallback;
    }

    const validRecords = parsedRecords.filter(isRecordItem);
    return validRecords.length === parsedRecords.length ? validRecords : fallback;
  } catch {
    return fallback;
  }
};

export const createRecordId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `rec-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};
