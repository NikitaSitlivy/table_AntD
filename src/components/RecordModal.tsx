import { CalendarOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Form, Input, Modal } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import {
  DATE_FORMAT,
  ISO_DATE_FORMAT,
  MAX_VALUE_DIGITS,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  VALIDATION_MESSAGES,
} from '../constants';
import type { ModalMode, RecordFormValues } from '../types';

type RecordModalFormValues = {
  name: string;
  date: string;
  value: string;
};

type RecordModalProps = {
  open: boolean;
  mode: ModalMode;
  initialValues: RecordFormValues | null;
  onCancel: () => void;
  onSubmit: (values: RecordFormValues) => void;
};

const modalMeta: Record<ModalMode, { title: string; okText: string }> = {
  create: {
    title: 'Добавить запись',
    okText: 'Сохранить',
  },
  edit: {
    title: 'Редактировать запись',
    okText: 'Обновить',
  },
};

const sanitizeDigits = (value: string) => value.replace(/\D/g, '');

const allowedDateControlKeys = new Set([
  'Backspace',
  'Delete',
  'Tab',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  'Enter',
  'Escape',
]);

const isDateInputKeyAllowed = (event: React.KeyboardEvent<HTMLInputElement>) => {
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return true;
  }

  if (allowedDateControlKeys.has(event.key)) {
    return true;
  }

  return /^\d$/.test(event.key);
};

const formatDateInput = (value: string) => {
  const digits = sanitizeDigits(value).slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  return [day, month, year].filter(Boolean).join('.');
};

const parseDateInput = (value: string) => {
  if (value.length !== DATE_FORMAT.length) {
    return null;
  }

  const parsedDate = dayjs(value, DATE_FORMAT, true);
  return parsedDate.isValid() ? parsedDate : null;
};

export function RecordModal({ open, mode, initialValues, onCancel, onSubmit }: RecordModalProps) {
  const [form] = Form.useForm<RecordModalFormValues>();
  const watchedValues = Form.useWatch([], form) as Partial<RecordModalFormValues> | undefined;
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState<Dayjs>(() => dayjs());
  const [dateInput, setDateInput] = useState('');
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setCalendarOpen(false);
      setCalendarViewDate(dayjs());
      setDateInput('');
      setDateError('');
      return;
    }

    if (initialValues) {
      const initialDate = dayjs(initialValues.date);
      const initialDateInput = initialDate.format(DATE_FORMAT);

      form.setFieldsValue({
        name: initialValues.name,
        date: initialDateInput,
        value: String(initialValues.value),
      });
      setDateInput(initialDateInput);
      setCalendarViewDate(initialDate);
      setDateError('');
      return;
    }

    form.resetFields();
    setDateInput('');
    setCalendarViewDate(dayjs());
    setDateError('');
  }, [form, initialValues, open]);

  const handleFinish = (values: RecordModalFormValues) => {
    const parsedDate = parseDateInput(values.date);

    if (!parsedDate) {
      return;
    }

    onSubmit({
      name: values.name.trim(),
      date: parsedDate.format(ISO_DATE_FORMAT),
      value: Number(values.value),
    });
  };

  const isUpdateDisabled = useMemo(() => {
    if (mode !== 'edit' || !initialValues) {
      return false;
    }

    const currentName = watchedValues?.name?.trim() ?? '';
    const currentDate = parseDateInput(watchedValues?.date ?? '')?.format(ISO_DATE_FORMAT) ?? '';
    const currentValue = watchedValues?.value ?? '';

    return (
      currentName === initialValues.name &&
      currentDate === initialValues.date &&
      currentValue === String(initialValues.value)
    );
  }, [initialValues, mode, watchedValues]);

  const selectedDate = parseDateInput(dateInput);

  const validateDateInput = (value: string) => {
    if (!value) {
      return VALIDATION_MESSAGES.dateRequired;
    }

    if (!parseDateInput(value)) {
      return VALIDATION_MESSAGES.dateInvalid;
    }

    return '';
  };

  return (
    <Modal
      destroyOnHidden
      forceRender
      open={open}
      title={modalMeta[mode].title}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Отмена
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={isUpdateDisabled}
          onClick={() => form.submit()}
        >
          {modalMeta[mode].okText}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
        autoComplete="off"
        onFinish={handleFinish}
        requiredMark={(label, info) =>
          info.required ? (
            <span>
              {label}
              <span className="form-required-mark">*</span>
            </span>
          ) : (
            label
          )
        }
      >
        <Form.Item
          required
          label="Имя"
          name="name"
          rules={[
            {
              validator: async (_, value: string | undefined) => {
                const normalizedValue = value?.trim() ?? '';

                if (!normalizedValue) {
                  throw new Error(VALIDATION_MESSAGES.nameRequired);
                }

                if (
                  normalizedValue.length < NAME_MIN_LENGTH ||
                  normalizedValue.length > NAME_MAX_LENGTH
                ) {
                  throw new Error(VALIDATION_MESSAGES.nameLength);
                }
              },
            },
          ]}
        >
          <Input maxLength={NAME_MAX_LENGTH} placeholder="Введите имя" />
        </Form.Item>

        <Form.Item
          hidden
          name="date"
          rules={[
            { required: true, message: VALIDATION_MESSAGES.dateRequired },
            {
              validator: async (_, value: string | undefined) => {
                if (!value) {
                  throw new Error(VALIDATION_MESSAGES.dateRequired);
                }

                if (!parseDateInput(value)) {
                  throw new Error(VALIDATION_MESSAGES.dateInvalid);
                }
              },
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Дата" required validateStatus={dateError ? 'error' : ''} help={dateError || undefined}>
          <div className="date-field-shell">
            <Input
              className="w-full"
              inputMode="numeric"
              maxLength={10}
              placeholder="ДД.ММ.ГГГГ"
              suffix={
                <CalendarOutlined
                  className="date-field-icon"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setCalendarViewDate(selectedDate ?? calendarViewDate);
                    setCalendarOpen(true);
                  }}
                />
              }
              value={dateInput}
              onChange={(event) => {
                const nextValue = formatDateInput(event.target.value);
                const parsedDate = parseDateInput(nextValue);

                setDateInput(nextValue);
                form.setFieldValue('date', nextValue);

                 if (nextValue.length === DATE_FORMAT.length) {
                  setDateError(validateDateInput(nextValue));
                } else {
                  setDateError('');
                }

                if (parsedDate) {
                  setCalendarViewDate(parsedDate);
                }
              }}
              onFocus={() => {
                setCalendarViewDate(selectedDate ?? calendarViewDate);
              }}
              onClick={() => {
                setCalendarViewDate(selectedDate ?? calendarViewDate);
                setCalendarOpen(true);
              }}
              onBlur={() => {
                setDateError(validateDateInput(dateInput));
                void form.validateFields(['date']);
              }}
              onKeyDown={(event) => {
                if (!isDateInputKeyAllowed(event)) {
                  event.preventDefault();
                }
              }}
            />

            <DatePicker
              className="date-field-picker-anchor"
              open={calendarOpen}
              value={selectedDate}
              pickerValue={calendarViewDate}
              format={DATE_FORMAT}
              inputReadOnly
              allowClear={false}
              onOpenChange={setCalendarOpen}
              onPanelChange={(value) => {
                setCalendarViewDate(value);
              }}
              onChange={(value) => {
                const nextValue = value ? value.format(DATE_FORMAT) : '';

                setDateInput(nextValue);
                form.setFieldValue('date', nextValue);
                setDateError(validateDateInput(nextValue));

                if (value) {
                  setCalendarViewDate(value);
                }

                void form.validateFields(['date']);
              }}
            />
          </div>
        </Form.Item>

        <Form.Item
          required
          label="Числовое значение"
          name="value"
          getValueFromEvent={(event) => sanitizeDigits(event.target.value).slice(0, MAX_VALUE_DIGITS + 1)}
          rules={[
            {
              validator: async (_, value: string | undefined) => {
                if (!value) {
                  throw new Error(VALIDATION_MESSAGES.valueRequired);
                }

                if (value.length > MAX_VALUE_DIGITS) {
                  throw new Error(VALIDATION_MESSAGES.valueDigits);
                }
              },
            },
          ]}
        >
          <Input
            className="w-full"
            inputMode="numeric"
            maxLength={MAX_VALUE_DIGITS + 1}
            placeholder="Введите число"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
