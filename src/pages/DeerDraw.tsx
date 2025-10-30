import { DeerDrawTable } from '@/components/tables/DeerDrawTable';

export default function DeerDraw() {
  return (
    <div className="container mx-auto py-6 h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Deer Draw Statistics</h1>
        <p className="text-muted-foreground">
          Explore Colorado deer draw odds and statistics for 2025
        </p>
      </div>
      <DeerDrawTable />
    </div>
  );
}
