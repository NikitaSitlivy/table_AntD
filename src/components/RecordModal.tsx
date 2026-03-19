import { useEffect, useMemo } from 'react';
import { Button, DatePicker, Form, Input, Modal } from 'antd';
import ruRU from 'antd/es/date-picker/locale/ru_RU';
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
  date: Dayjs;
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

const datePickerLocale = {
  ...ruRU,
  lang: {
    ...ruRU.lang,
    placeholder: 'ДД.ММ.ГГГГ',
  },
};

export function RecordModal({ open, mode, initialValues, onCancel, onSubmit }: RecordModalProps) {
  const [form] = Form.useForm<RecordModalFormValues>();
  const watchedValues = Form.useWatch([], form) as Partial<RecordModalFormValues> | undefined;

  useEffect(() => {
    if (!open) {
      form.resetFields();
      return;
    }

    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        date: dayjs(initialValues.date),
        value: String(initialValues.value),
      });
      return;
    }

    form.resetFields();
  }, [form, initialValues, open]);

  useEffect(() => {
    if (!open || !initialValues) {
      return;
    }

    form.setFieldsValue({
      name: initialValues.name,
      date: dayjs(initialValues.date),
      value: String(initialValues.value),
    });
  }, [form, initialValues, open]);

  const handleFinish = (values: RecordModalFormValues) => {
    onSubmit({
      name: values.name.trim(),
      date: values.date.format(ISO_DATE_FORMAT),
      value: Number(values.value),
    });
  };

  const isUpdateDisabled = useMemo(() => {
    if (mode !== 'edit' || !initialValues) {
      return false;
    }

    const currentName = watchedValues?.name?.trim() ?? '';
    const currentDate = watchedValues?.date?.isValid() ? watchedValues.date.format(ISO_DATE_FORMAT) : '';
    const currentValue = watchedValues?.value ?? '';

    return (
      currentName === initialValues.name &&
      currentDate === initialValues.date &&
      currentValue === String(initialValues.value)
    );
  }, [initialValues, mode, watchedValues]);

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
          required
          label="Дата"
          name="date"
          rules={[
            { required: true, message: VALIDATION_MESSAGES.dateRequired },
            {
              validator: async (_, value: Dayjs | undefined) => {
                if (!value) {
                  return;
                }

                if (!value.isValid()) {
                  throw new Error(VALIDATION_MESSAGES.dateInvalid);
                }
              },
            },
          ]}
        >
          <DatePicker
            className="w-full"
            format={DATE_FORMAT}
            locale={datePickerLocale}
            placeholder="ДД.ММ.ГГГГ"
            style={{ width: '100%' }}
          />
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
