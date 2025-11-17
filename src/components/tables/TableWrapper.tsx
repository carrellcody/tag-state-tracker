import { ReactNode } from 'react';

interface TableWrapperProps {
  children: ReactNode;
}

export function TableWrapper({ children }: TableWrapperProps) {
  return (
    <div className="w-full">
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow-sm sm:rounded-lg">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
