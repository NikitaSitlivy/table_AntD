import { useEffect } from 'react';
import { Button, DatePicker, Form, Input, InputNumber, Modal } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import {
  ISO_DATE_FORMAT,
  MAX_VALUE,
  MIN_VALUE,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  VALIDATION_MESSAGES,
} from '../constants';
import type { ModalMode, RecordFormValues } from '../types';

type RecordModalFormValues = {
  name: string;
  date: Dayjs;
  value: number;
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

export function RecordModal({ open, mode, initialValues, onCancel, onSubmit }: RecordModalProps) {
  const [form] = Form.useForm<RecordModalFormValues>();

  useEffect(() => {
    if (!open) {
      form.resetFields();
      return;
    }

    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        date: dayjs(initialValues.date),
        value: initialValues.value,
      });
      return;
    }

    form.resetFields();
  }, [form, initialValues, open]);

  const handleFinish = (values: RecordModalFormValues) => {
    onSubmit({
      name: values.name.trim(),
      date: values.date.format(ISO_DATE_FORMAT),
      value: values.value,
    });
  };

  return (
    <Modal
      destroyOnHidden
      open={open}
      title={modalMeta[mode].title}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Отмена
        </Button>,
        <Button key="submit" type="primary" onClick={() => form.submit()}>
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
      >
        <Form.Item
          label="Имя"
          name="name"
          rules={[
            { required: true, message: VALIDATION_MESSAGES.nameRequired },
            {
              validator: async (_, value: string | undefined) => {
                const normalizedValue = value?.trim() ?? '';

                if (!normalizedValue) {
                  throw new Error(VALIDATION_MESSAGES.nameWhitespace);
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
          label="Дата"
          name="date"
          rules={[{ required: true, message: VALIDATION_MESSAGES.dateRequired }]}
        >
          <DatePicker className="w-full" format="DD.MM.YYYY" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Числовое значение"
          name="value"
          rules={[
            { required: true, message: VALIDATION_MESSAGES.valueRequired },
            {
              type: 'number',
              min: MIN_VALUE,
              max: MAX_VALUE,
              message: VALIDATION_MESSAGES.valueRange,
            },
          ]}
        >
          <InputNumber
            className="w-full"
            min={MIN_VALUE}
            max={MAX_VALUE}
            precision={0}
            style={{ width: '100%' }}
            placeholder="Введите число"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
