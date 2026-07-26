import { Link } from "react-router-dom";

interface UnitMapLinkProps {
  unit: string;
  className?: string;
}

/**
 * Links a unit number to the interactive unit map, zoomed to that unit.
 */
export function UnitMapLink({ unit, className }: UnitMapLinkProps) {
  const value = String(unit ?? "").trim();
  if (!value) return null;
  return (
    <Link
      to={`/unit_map?unit=${encodeURIComponent(value)}`}
      onClick={(e) => e.stopPropagation()}
      className={className ?? "hover:underline"}
    >
      {value}
    </Link>
  );
}
