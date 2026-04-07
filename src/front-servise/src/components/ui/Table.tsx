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
}

function TableRow<T extends Record<string, unknown>>({
  row,
  columns,
}: {
  row: T;
  columns: TableColumn<T>[];
}) {
  const [spring, api] = useSpring(() => ({
    backgroundColor: 'rgba(15,23,42,0)',
    config: { tension: 300, friction: 30 },
  }));

  return (
    <animated.tr
      style={spring}
      onMouseEnter={() => api.start({ backgroundColor: 'rgba(30,41,59,0.45)' })}
      onMouseLeave={() => api.start({ backgroundColor: 'rgba(15,23,42,0)' })}
      className="border-b border-slate-800/60 transition-colors"
    >
      {columns.map((col) => (
        <td
          key={String(col.key)}
          className={[
            'px-4 py-3 text-sm text-slate-300',
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
}: TableProps<T>) {
  return (
    <div className="rounded-xl border border-slate-800/80 overflow-hidden bg-slate-900/40">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={[
                    'px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-900/60',
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
                  className="px-4 py-8 text-center text-sm text-slate-600"
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
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
