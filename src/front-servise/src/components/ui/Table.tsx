'use client';

import { useSpring, animated } from '@react-spring/web';
import { ReactNode } from 'react';

export interface TableColumn<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T extends Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor?: (row: T, index: number) => string | number;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

function TableRow<T extends Record<string, unknown>>({
  row,
  columns,
  onRowClick,
}: {
  row: T;
  columns: TableColumn<T>[];
  onRowClick?: (row: T) => void;
}) {
  const [spring, api] = useSpring(() => ({
    backgroundColor: 'rgba(0,0,0,0)',
    config: { tension: 300, friction: 30 },
  }));

  return (
    <animated.tr
      style={spring}
      onMouseEnter={() => api.start({ backgroundColor: 'var(--color-hover)' })}
      onMouseLeave={() => api.start({ backgroundColor: 'rgba(0,0,0,0)' })}
      onClick={onRowClick ? () => onRowClick(row) : undefined}
      className={[
        'border-b border-border transition-colors',
        onRowClick ? 'cursor-pointer' : '',
      ].join(' ')}
    >
      {columns.map((col) => (
        <td
          key={String(col.key)}
          className={[
            'px-4 py-3 text-sm text-text',
            col.align === 'center'
              ? 'text-center'
              : col.align === 'right'
                ? 'text-right'
                : 'text-left',
          ].join(' ')}
        >
          {col.render
            ? col.render(row[col.key], row)
            : (row[col.key] as ReactNode)}
        </td>
      ))}
    </animated.tr>
  );
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'Brak danych',
  onRowClick,
}: TableProps<T>) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-raised">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={[
                    'px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider',
                    col.align === 'center'
                      ? 'text-center'
                      : col.align === 'right'
                        ? 'text-right'
                        : 'text-left',
                  ].join(' ')}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-sm text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <TableRow
                  key={keyExtractor ? keyExtractor(row, i) : i}
                  row={row}
                  columns={columns}
                  onRowClick={onRowClick}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
