import React from 'react';
import { cn } from '../../utils/cn';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  variant?: 'default' | 'striped' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  hover?: boolean;
}

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  sortable?: boolean;
  onSort?: () => void;
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  editable?: boolean;
  onEdit?: (value: string) => void;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseClasses = 'w-full border-collapse';
    
    const variants = {
      default: 'border border-neutral-200',
      striped: 'border border-neutral-200',
      bordered: 'border-2 border-neutral-300'
    };

    return (
      <div className="overflow-x-auto">
        <table
          ref={ref}
          className={cn(baseClasses, variants[variant], className)}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={cn('bg-neutral-50 border-b border-neutral-200', className)}
        {...props}
      >
        {children}
      </thead>
    );
  }
);

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={cn('divide-y divide-neutral-200', className)}
        {...props}
      >
        {children}
      </tbody>
    );
  }
);

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, hover = false, children, ...props }, ref) => {
    const hoverClass = hover ? 'hover:bg-neutral-50 transition-colors' : '';
    
    return (
      <tr
        ref={ref}
        className={cn(hoverClass, className)}
        {...props}
      >
        {children}
      </tr>
    );
  }
);

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, sortable = false, onSort, children, ...props }, ref) => {
    const baseClasses = 'px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider';
    const sortableClass = sortable ? 'cursor-pointer hover:bg-neutral-100 select-none' : '';

    return (
      <th
        ref={ref}
        className={cn(baseClasses, sortableClass, className)}
        onClick={sortable ? onSort : undefined}
        {...props}
      >
        <div className="flex items-center gap-2">
          {children}
          {sortable && (
            <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          )}
        </div>
      </th>
    );
  }
);

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, editable = false, onEdit, children, ...props }, ref) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [value, setValue] = React.useState(String(children || ''));

    const handleDoubleClick = () => {
      if (editable) {
        setIsEditing(true);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        setIsEditing(false);
        setValue(String(children || ''));
      }
    };

    const handleSave = () => {
      setIsEditing(false);
      if (onEdit) {
        onEdit(value);
      }
    };

    const baseClasses = 'px-4 py-3 text-sm text-neutral-900';
    const editableClass = editable ? 'cursor-pointer hover:bg-neutral-50' : '';

    return (
      <td
        ref={ref}
        className={cn(baseClasses, editableClass, className)}
        onDoubleClick={handleDoubleClick}
        {...props}
      >
        {isEditing ? (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="w-full px-2 py-1 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            autoFocus
          />
        ) : (
          children
        )}
      </td>
    );
  }
);

Table.displayName = 'Table';
TableHeader.displayName = 'TableHeader';
TableBody.displayName = 'TableBody';
TableRow.displayName = 'TableRow';
TableHead.displayName = 'TableHead';
TableCell.displayName = 'TableCell';

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }; 