export type RecordItem = {
  id: string;
  name: string;
  date: string;
  value: number;
};

export type RecordFormValues = {
  name: string;
  date: string;
  value: number;
};

export type ModalMode = 'create' | 'edit';
