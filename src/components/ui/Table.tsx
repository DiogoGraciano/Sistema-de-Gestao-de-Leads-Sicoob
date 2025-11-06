import React from 'react';
import { clsx } from 'clsx';
import { Database, Search, AlertCircle } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  title?: string;
  showRowNumbers?: boolean;
  rowNumberOffset?: number;
  variant?: 'default' | 'modern' | 'elegant';
}

function Table<T extends { id?: number | string }>({
  columns,
  data,
  className,
  onRowClick,
  isLoading = false,
  emptyMessage = 'Nenhum dado encontrado',
  title,
  showRowNumbers = false,
  rowNumberOffset = 0,
  variant = 'modern',
}: TableProps<T>) {
  const LoadingSpinner = () => (
    <div className="flex flex-col justify-center items-center py-16">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200"></div>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent absolute top-0 left-0"></div>
      </div>
      <p className="mt-4 text-gray-600 animate-pulse">Carregando dados...</p>
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col justify-center items-center py-16">
      <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
        <Database className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum resultado encontrado</h3>
      <p className="text-gray-500 text-center max-w-md">
        {emptyMessage}
      </p>
      <div className="mt-4 flex items-center text-sm text-gray-400">
        <Search className="h-4 w-4 mr-1" />
        Tente ajustar os filtros de busca
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <LoadingSpinner />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <EmptyState />
      </div>
    );
  }

  const tableVariants = {
    default: {
      container: 'bg-white rounded-lg shadow-md border border-gray-200',
      header: 'bg-gray-50',
      headerText: 'text-gray-700',
      row: 'hover:bg-gray-50',
    },
    modern: {
      container: 'bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden',
      header: 'bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-100',
      headerText: 'text-gray-800 font-semibold',
      row: 'hover:bg-gradient-to-r hover:from-orange-25 hover:to-red-25 hover:shadow-md border-b border-gray-50',
    },
    elegant: {
      container: 'bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl border-2 border-gray-100 overflow-hidden',
      header: 'bg-gradient-to-r from-gray-700 to-gray-800 text-white',
      headerText: 'text-white font-bold',
      row: 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-lg border-b border-gray-100',
    }
  };

  const styles = tableVariants[variant];

  return (
    <div className={clsx(styles.container, className)}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              {data.length} {data.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className={styles.header}>
            <tr>
              {showRowNumbers && (
                <th className={clsx(
                  'px-4 py-4 text-left text-xs font-bold uppercase tracking-wider w-16',
                  styles.headerText
                )}>
                  #
                </th>
              )}
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={clsx(
                    'px-6 py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors',
                    styles.headerText,
                    column.sortable && 'cursor-pointer hover:bg-opacity-80',
                    column.className
                  )}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <div className="w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-current opacity-50 text-xs"></div>
                        <div className="w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-current opacity-50 text-xs"></div>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {data.map((item, rowIndex) => (
              <tr
                key={item.id || rowIndex}
                className={clsx(
                  'transition-all duration-200 ease-in-out',
                  styles.row,
                  {
                    'cursor-pointer transform hover:scale-[1.01]': !!onRowClick,
                  }
                )}
                onClick={() => onRowClick?.(item)}
              >
                {showRowNumbers && (
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                    {rowIndex + 1 + rowNumberOffset}
                  </td>
                )}
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={clsx(
                      'px-6 py-4 text-sm text-gray-900',
                      column.className
                    )}
                  >
                    <div className="flex items-center">
                      {column.render
                        ? column.render(item)
                        : typeof column.key === 'string'
                        ? (item as any)[column.key]
                        : item[column.key]}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Rodapé da tabela */}
      <div className="px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span>
              Exibindo {data.length} {data.length === 1 ? 'resultado' : 'resultados'}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {onRowClick && 'Clique em uma linha para mais detalhes'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Table;
