import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Empty,
  Flex,
  Input,
  Popconfirm,
  Space,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { SortOrder, SorterResult } from 'antd/es/table/interface';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { INITIAL_RECORDS, RECORDS_STORAGE_KEY, SEARCH_PLACEHOLDER } from '../constants';
import {
  compareByDate,
  compareByName,
  compareByValue,
  createRecordId,
  filterRecords,
  formatDisplayDate,
} from '../helpers';
import type { ModalMode, RecordFormValues, RecordItem } from '../types';
import { RecordModal } from './RecordModal';

const { Paragraph, Text, Title } = Typography;
const actionTooltipProps = {
  destroyOnHidden: true,
  mouseLeaveDelay: 0,
  styles: {
    root: {
      pointerEvents: 'none',
    },
  },
} as const;

export function CrudTable() {
  const [records, setRecords] = useState<RecordItem[]>(() => {
    if (typeof window === 'undefined') {
      return INITIAL_RECORDS;
    }

    const savedRecords = window.localStorage.getItem(RECORDS_STORAGE_KEY);

    if (!savedRecords) {
      return INITIAL_RECORDS;
    }

    try {
      const parsedRecords = JSON.parse(savedRecords) as RecordItem[];

      if (!Array.isArray(parsedRecords)) {
        return INITIAL_RECORDS;
      }

      return parsedRecords;
    } catch {
      return INITIAL_RECORDS;
    }
  });
  const [searchValue, setSearchValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>('create');
  const [editingRecord, setEditingRecord] = useState<RecordItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortState, setSortState] = useState<{ columnKey?: string; order?: SortOrder }>({
    columnKey: 'date',
    order: 'descend',
  });

  useEffect(() => {
    window.localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const filteredRecords = useMemo(
    () => filterRecords(records, searchValue),
    [records, searchValue],
  );

  const hasActiveSearch = searchValue.trim().length > 0;

  const openCreateModal = () => {
    setMode('create');
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const openEditModal = (record: RecordItem) => {
    setMode('edit');
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const handleDelete = (id: string) => {
    setRecords((currentRecords) => currentRecords.filter((record) => record.id !== id));
  };

  const handleSubmit = (values: RecordFormValues) => {
    if (mode === 'create') {
      const nextRecord: RecordItem = {
        id: createRecordId(),
        ...values,
      };

      setRecords((currentRecords) => [...currentRecords, nextRecord]);
      closeModal();
      return;
    }

    if (!editingRecord) {
      return;
    }

    setRecords((currentRecords) =>
      currentRecords.map((record) =>
        record.id === editingRecord.id ? { ...record, ...values } : record,
      ),
    );
    closeModal();
  };

  const columns = useMemo<ColumnsType<RecordItem>>(
    () => [
      {
        title: 'Имя',
        dataIndex: 'name',
        key: 'name',
        width: 280,
        sorter: compareByName,
        sortOrder: sortState.columnKey === 'name' ? sortState.order : null,
        sortDirections: ['ascend', 'descend', 'ascend'],
        showSorterTooltip: {
          target: 'full-header',
          title:
            sortState.columnKey === 'name' && sortState.order === 'ascend'
              ? 'Сортировать от Я до А'
              : 'Сортировать от А до Я',
        },
      },
      {
        title: 'Дата',
        dataIndex: 'date',
        key: 'date',
        width: 180,
        sorter: compareByDate,
        sortOrder: sortState.columnKey === 'date' ? sortState.order : null,
        sortDirections: ['descend', 'ascend', 'descend'],
        showSorterTooltip: { target: 'full-header' },
        render: (value: string) => formatDisplayDate(value),
      },
      {
        title: 'Числовое значение',
        dataIndex: 'value',
        key: 'value',
        width: 220,
        align: 'right',
        sorter: compareByValue,
        sortOrder: sortState.columnKey === 'value' ? sortState.order : null,
        sortDirections: ['descend', 'ascend', 'descend'],
        showSorterTooltip: { target: 'full-header' },
        render: (value: number) => new Intl.NumberFormat('ru-RU').format(value),
      },
      {
        title: 'Действия',
        key: 'actions',
        width: 140,
        fixed: 'right',
        render: (_, record) => (
          <Space size="small">
            <Tooltip title="Редактировать" {...actionTooltipProps}>
              <Button
                aria-label={`Редактировать ${record.name}`}
                icon={<EditOutlined />}
                onClick={() => openEditModal(record)}
              />
            </Tooltip>
            <Popconfirm
              title="Удалить запись?"
              description={`Запись «${record.name}» будет удалена без возможности восстановления.`}
              okText="Удалить"
              cancelText="Отмена"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDelete(record.id)}
            >
              <Tooltip title="Удалить" {...actionTooltipProps}>
                <Button danger aria-label={`Удалить ${record.name}`} icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [sortState],
  );

  const locale = useMemo(
    () => ({
      emptyText: (
        <Empty
          description={
            hasActiveSearch
              ? 'По вашему запросу ничего не найдено'
              : 'Пока нет записей. Добавьте первую строку через кнопку выше.'
          }
        />
      ),
    }),
    [hasActiveSearch],
  );

  return (
    <div className="page-shell">
      <div className="page-gradient" />
      <Card className="content-card" bordered={false}>
        <Flex vertical gap={24}>
          <Flex className="hero-block" vertical gap={10}>
            <Text className="eyebrow">React + TypeScript + Ant Design</Text>
            <Title level={2} style={{ margin: 0 }}>
              CRUD-таблица с глобальным поиском и типовой сортировкой
            </Title>
            <Paragraph className="hero-text">
              Данные фильтруются по всем отображаемым ячейкам, сортируются по типу значения и
              редактируются через одну модальную форму без дублирования логики.
            </Paragraph>
          </Flex>

          <Flex className="toolbar" gap={12} justify="space-between" wrap>
            <Button icon={<PlusOutlined />} size="large" type="primary" onClick={openCreateModal}>
              Добавить
            </Button>

            <Input
              allowClear
              className="search-input"
              placeholder={SEARCH_PLACEHOLDER}
              prefix={<SearchOutlined />}
              size="large"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </Flex>

          <Table<RecordItem>
            columns={columns}
            dataSource={filteredRecords}
            locale={locale}
            onChange={(pagination, __, sorter) => {
              const nextSorter = Array.isArray(sorter) ? sorter[0] : (sorter as SorterResult<RecordItem>);
              const nextColumnKey =
                typeof nextSorter.columnKey === 'string' ? nextSorter.columnKey : undefined;
              const nextOrder = nextSorter.order ?? undefined;
              const shouldResetPage =
                nextColumnKey !== sortState.columnKey || nextOrder !== sortState.order;

              setSortState({
                columnKey: nextColumnKey,
                order: nextOrder,
              });

              setCurrentPage(shouldResetPage ? 1 : (pagination.current ?? 1));
            }}
            pagination={{
              current: currentPage,
              pageSize: 6,
              hideOnSinglePage: filteredRecords.length <= 6,
              showSizeChanger: false,
            }}
            rowKey="id"
            scroll={{ x: 820 }}
          />
        </Flex>
      </Card>

      <RecordModal
        open={isModalOpen}
        mode={mode}
        initialValues={
          editingRecord
            ? {
                name: editingRecord.name,
                date: editingRecord.date,
                value: editingRecord.value,
              }
            : null
        }
        onCancel={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
