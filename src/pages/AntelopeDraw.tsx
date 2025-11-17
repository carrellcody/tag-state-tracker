import { AntelopeDrawTable } from '@/components/tables/AntelopeDrawTable';
import { AdvertiseBox } from '@/components/AdvertiseBox';

export default function AntelopeDraw() {
  return (
    <div className="container mx-auto py-6 h-[calc(100vh-8rem)]">
      <AdvertiseBox />
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Antelope Draw Statistics</h1>
        <p className="text-muted-foreground">
          Explore Colorado antelope draw odds and statistics for 2025
        </p>
      </div>
      <AntelopeDrawTable />
    </div>
  );
}
