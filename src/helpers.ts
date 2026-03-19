import dayjs from 'dayjs';
import { DATE_FORMAT } from './constants';
import type { RecordItem } from './types';

export const formatDisplayDate = (value: string) => dayjs(value).format(DATE_FORMAT);

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

export const compareByName = (left: RecordItem, right: RecordItem) =>
  left.name.localeCompare(right.name, 'ru', { sensitivity: 'base' });

export const compareByDate = (left: RecordItem, right: RecordItem) =>
  dayjs(left.date).valueOf() - dayjs(right.date).valueOf();

export const compareByValue = (left: RecordItem, right: RecordItem) => left.value - right.value;

export const createRecordId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `rec-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};
