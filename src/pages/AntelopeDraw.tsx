import { AntelopeDrawTable } from '@/components/tables/AntelopeDrawTable';


export default function AntelopeDraw() {
  return (
    <div className="container mx-auto py-6 pb-0 h-[calc(100vh-8rem)]">
      <div className="flex items-start gap-6 mb-3">
        <div className="flex-shrink-0">
          <h1 className="text-3xl font-bold mb-1">Antelope Draw Statistics</h1>
          <p className="text-muted-foreground text-sm">Explore Colorado antelope draw odds and statistics for 2025</p>
        </div>
      </div>
      <AntelopeDrawTable />
    </div>
  );
}
