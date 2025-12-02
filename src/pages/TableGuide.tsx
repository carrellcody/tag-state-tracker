import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TableGuide() {
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

  // Draw table columns
  const drawColumns = [
    { key: "hunt_code", label: "Hunt Code", explanation: "" },
    { key: "list", label: "List", explanation: "" },
    { key: "valid_units", label: "Valid Units", explanation: "" },
    { key: "drawn_out_level", label: "Drawn Out Level 2025", explanation: "" },
    { key: "chance_with_points", label: "Chance with your preference points", explanation: "" },
    { key: "chance_at_dol", label: "Chance at Drawn Out Level", explanation: "" },
    { key: "sex", label: "Sex", explanation: "" },
    { key: "weapon", label: "Weapon", explanation: "" },
    { key: "notes", label: "Notes", explanation: "" },
  ];

  // Expanded submenu columns
  const submenuColumns = [
    { key: "unit", label: "Unit", explanation: "" },
    { key: "harvest_category", label: "Harvest Category", explanation: "" },
    { key: "bucks", label: "Bucks", explanation: "" },
    { key: "antlerless", label: "Antlerless", explanation: "" },
    { key: "total_hunters", label: "Total Hunters", explanation: "" },
    { key: "success_percent", label: "Success %", explanation: "" },
    { key: "public_percent", label: "Public %", explanation: "" },
  ];

  // Harvest table columns
  const harvestColumns = [
    { key: "unit_list", label: "Unit", explanation: "" },
    { key: "category", label: "Category", explanation: "" },
    { key: "bucks_harvest", label: "Bucks", explanation: "" },
    { key: "antlerless_harvest", label: "Antlerless", explanation: "" },
    { key: "total_harvest", label: "Total Harvest", explanation: "" },
    { key: "total_hunters_harvest", label: "Total Hunters", explanation: "" },
    { key: "success_rate", label: "Success %", explanation: "" },
    { key: "public_land_percent", label: "Public %", explanation: "" },
    { key: "acres_public", label: "Public Acres", explanation: "" },
    { key: "hunters_density", label: "Hunters/Public Sq. Mile", explanation: "" },
  ];

  const handleColumnClick = (columnKey: string) => {
    setSelectedColumn(columnKey);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-4xl font-bold mb-4 text-center">Learn About Taggout Tables</h1>
      <p className="text-xl text-muted-foreground text-center mb-12">
        Click on any column header below to learn what it means
      </p>

      <div className="space-y-8">
        {/* Draw Table Section */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="text-2xl">Draw Table Columns</CardTitle>
            <p className="text-sm text-muted-foreground">
              These columns appear in the main draw statistics tables (Deer, Elk, Antelope)
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-6">
              {drawColumns.map((col) => (
                <Badge
                  key={col.key}
                  variant={selectedColumn === col.key ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/20 px-4 py-2 text-sm transition-colors"
                  onClick={() => handleColumnClick(col.key)}
                >
                  {col.label}
                </Badge>
              ))}
            </div>
            {selectedColumn && drawColumns.find(c => c.key === selectedColumn) && (
              <div className="bg-accent/20 border border-accent rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">
                  {drawColumns.find(c => c.key === selectedColumn)?.label}
                </h3>
                <p className="text-muted-foreground">
                  {drawColumns.find(c => c.key === selectedColumn)?.explanation || 
                    "Explanation will be added here..."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expanded Submenu Section */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="text-2xl">Draw Table Dropdown Details</CardTitle>
            <p className="text-sm text-muted-foreground">
              Click the arrow next to a hunt code in the draw table to see these additional harvest statistics
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-6">
              {submenuColumns.map((col) => (
                <Badge
                  key={col.key}
                  variant={selectedColumn === col.key ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/20 px-4 py-2 text-sm transition-colors"
                  onClick={() => handleColumnClick(col.key)}
                >
                  {col.label}
                </Badge>
              ))}
            </div>
            {selectedColumn && submenuColumns.find(c => c.key === selectedColumn) && (
              <div className="bg-accent/20 border border-accent rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">
                  {submenuColumns.find(c => c.key === selectedColumn)?.label}
                </h3>
                <p className="text-muted-foreground">
                  {submenuColumns.find(c => c.key === selectedColumn)?.explanation || 
                    "Explanation will be added here..."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Harvest Table Section */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="text-2xl">Harvest Table Columns</CardTitle>
            <p className="text-sm text-muted-foreground">
              These columns appear in the harvest statistics tables (Deer, Elk, Antelope)
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-6">
              {harvestColumns.map((col) => (
                <Badge
                  key={col.key}
                  variant={selectedColumn === col.key ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/20 px-4 py-2 text-sm transition-colors"
                  onClick={() => handleColumnClick(col.key)}
                >
                  {col.label}
                </Badge>
              ))}
            </div>
            {selectedColumn && harvestColumns.find(c => c.key === selectedColumn) && (
              <div className="bg-accent/20 border border-accent rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">
                  {harvestColumns.find(c => c.key === selectedColumn)?.label}
                </h3>
                <p className="text-muted-foreground">
                  {harvestColumns.find(c => c.key === selectedColumn)?.explanation || 
                    "Explanation will be added here..."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
