import React, { useEffect, useRef, useState } from "react";
import pointOnFeature from "@turf/point-on-feature";
import type { Feature, GeoJsonProperties, Geometry } from "geojson";
import { SEOHead } from "@/components/SEOHead";

// The attribute key on each GeoJSON feature that holds the unit number.
// Update this to match the column in your shapefile (e.g. "GMUID", "UNIT", "DAU").
const UNIT_PROPERTY_CANDIDATES = ["GMUID", "UNIT", "GMU", "Unit", "unit", "DAU"];

const GOOGLE_MAPS_BROWSER_KEY = import.meta.env
  .VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
const GOOGLE_MAPS_CHANNEL = import.meta.env
  .VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string | undefined;

const COLORADO_CENTER = { lat: 39.0, lng: -105.55 };
const INITIAL_ZOOM = 7;
const LABEL_MIN_ZOOM = 6;

const LAND_COLORS: Record<string, { fill: string; stroke: string }> = {
  "National Forest": { fill: "#22c55e", stroke: "#15803d" }, // green
  BLM: { fill: "#eab308", stroke: "#a16207" }, // yellow
  "State Land": { fill: "#3b82f6", stroke: "#1d4ed8" }, // blue
};

type GeoJsonFeature = Feature<Geometry, GeoJsonProperties>;
type GoogleMapFeature = {
  getProperty?: (name: string) => unknown;
  toGeoJson: (callback: (feature: GeoJsonFeature) => void) => void;
};
type GoogleMapFeatureEvent = { feature: GoogleMapFeature; latLng?: unknown };
type GoogleMarker = { setVisible: (visible: boolean) => void; setMap: (map: null) => void };
type GoogleMapData = {
  setMap: (map: GoogleMap | null) => void;
  setStyle: (style: Record<string, unknown> | ((feature: GoogleMapFeature) => Record<string, unknown>)) => void;
  addListener: (eventName: string, handler: (event: GoogleMapFeatureEvent) => void) => void;
  overrideStyle: (feature: GoogleMapFeature, style: Record<string, unknown>) => void;
  revertStyle: () => void;
  addGeoJson: (geoJson: unknown) => void;
  loadGeoJson: (url: string, options: unknown, callback: () => void) => void;
};
type GoogleLatLngBounds = {
  extend: (position: { lat: number; lng: number }) => void;
  isEmpty: () => boolean;
};
type GoogleMap = {
  data: GoogleMapData;
  getZoom: () => number | undefined;
  addListener: (eventName: string, handler: () => void) => void;
  fitBounds: (bounds: GoogleLatLngBounds, padding?: number) => void;
};
type GoogleMapsNamespace = {
  maps: {
    Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMap;
    Data: new () => GoogleMapData;
    LatLngBounds: new () => GoogleLatLngBounds;
    InfoWindow: new () => {
      setContent: (content: string) => void;
      setPosition: (position: unknown) => void;
      open: (map: GoogleMap) => void;
    };
    Marker: new (options: Record<string, unknown>) => GoogleMarker;
    SymbolPath: { CIRCLE: unknown };
  };
};


declare global {
  interface Window {
    initUnitMap?: () => void;
    gm_authFailure?: () => void;
    google?: GoogleMapsNamespace;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizePosition(position: unknown): number[] | null {
  if (!Array.isArray(position) || position.length < 2) return null;
  const lng = Number(position[0]);
  const lat = Number(position[1]);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
  return [lng, lat];
}

function samePosition(a: number[], b: number[]): boolean {
  return a.length >= 2 && b.length >= 2 && a[0] === b[0] && a[1] === b[1];
}

function closeLinearRing(ring: unknown): number[][] {
  if (!Array.isArray(ring)) return [];
  const cleaned = ring
    .map(normalizePosition)
    .filter((position): position is number[] => Array.isArray(position));

  if (cleaned.length === 0) return cleaned;

  const first = cleaned[0];
  while (cleaned.length < 4) {
    cleaned.push([...first]);
  }

  const last = cleaned[cleaned.length - 1];
  if (!samePosition(first, last)) {
    cleaned.push([...first]);
  }

  return cleaned;
}

function sanitizeGeometry(geometry: unknown): void {
  if (!isRecord(geometry)) return;

  if (geometry.type === "Polygon" && Array.isArray(geometry.coordinates)) {
    geometry.coordinates = geometry.coordinates.map(closeLinearRing);
    return;
  }

  if (geometry.type === "MultiPolygon" && Array.isArray(geometry.coordinates)) {
    geometry.coordinates = geometry.coordinates.map((polygon) => {
      if (!Array.isArray(polygon)) return [];
      return polygon.map(closeLinearRing);
    });
  }
}

function sanitizeGeoJson(geoJson: unknown): unknown {
  if (!isRecord(geoJson)) return geoJson;

  if (geoJson.type === "FeatureCollection" && Array.isArray(geoJson.features)) {
    geoJson.features.forEach((feature) => {
      if (!isRecord(feature)) return;
      sanitizeGeometry(feature.geometry);
    });
    return geoJson;
  }

  if (geoJson.type === "Feature") {
    sanitizeGeometry(geoJson.geometry);
    return geoJson;
  }

  sanitizeGeometry(geoJson);
  return geoJson;
}

async function loadSanitizedGeoJson(layer: GoogleMapData, url: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load map data: ${url}`);
  }
  const geoJson = sanitizeGeoJson(await response.json());
  layer.addGeoJson(geoJson);
}

function pickUnitNumberFromFeature(feature: GoogleMapFeature): string | null {
  for (const key of UNIT_PROPERTY_CANDIDATES) {
    const v = feature.getProperty?.(key);
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      return String(v);
    }
  }
  return null;
}

function getCssHslToken(tokenName: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(tokenName)
    .trim();
  return `hsl(${value})`;
}

function normalizeUnit(value: string): string {
  return String(value).trim().replace(/^0+(?=\d)/, "").toUpperCase();
}

function collectPositions(coords: unknown, out: { lat: number; lng: number }[]): void {
  if (!Array.isArray(coords)) return;
  if (typeof coords[0] === "number" && typeof coords[1] === "number") {
    out.push({ lng: Number(coords[0]), lat: Number(coords[1]) });
    return;
  }
  coords.forEach((c) => collectPositions(c, out));
}

const UnitMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<GoogleMap | null>(null);
  const labelMarkersRef = useRef<GoogleMarker[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const targetUnit = React.useMemo(() => {
    const raw = new URLSearchParams(window.location.search).get("unit");
    return raw ? normalizeUnit(raw) : null;
  }, []);

  useEffect(() => {

    if (!GOOGLE_MAPS_BROWSER_KEY) {
      setStatus("error");
      setErrorMsg("Google Maps browser key is not configured.");
      return;
    }

    window.gm_authFailure = () => {
      setStatus("error");
      setErrorMsg("Google Maps is not authorized for this domain.");
    };

    const initMap = () => {
      if (!mapRef.current || !window.google?.maps) return;

      const map = new window.google.maps.Map(mapRef.current, {
        center: COLORADO_CENTER,
        zoom: INITIAL_ZOOM,
        mapTypeId: "hybrid",
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });
      mapInstanceRef.current = map;

      const primaryColor = getCssHslToken("--primary");
      const boundaryColor = getCssHslToken("--map-boundary");

      // GMU boundary layer (default map.data)
      map.data.setStyle({
        fillColor: primaryColor,
        fillOpacity: 0.08,
        strokeColor: boundaryColor,
        strokeOpacity: 0.95,
        strokeWeight: 1.6,
      });

      map.data.addListener("mouseover", (e: GoogleMapFeatureEvent) => {
        map.data.overrideStyle(e.feature, { strokeWeight: 3, fillOpacity: 0.18 });
      });
      map.data.addListener("mouseout", () => {
        map.data.revertStyle();
      });

      const infoWindow = new window.google.maps.InfoWindow();
      map.data.addListener("click", (e: GoogleMapFeatureEvent) => {
        const unit = pickUnitNumberFromFeature(e.feature);
        if (!unit) return;
        infoWindow.setContent(
          `<div style="font-family:sans-serif;font-weight:600;color:#222;">Unit ${unit}</div>`
        );
        infoWindow.setPosition(e.latLng);
        infoWindow.open(map);
      });

      const targetBounds = new window.google.maps.LatLngBounds();

      const addLabelForFeature = (feature: GoogleMapFeature) => {
        const unit = pickUnitNumberFromFeature(feature);
        if (!unit) return;
        feature.toGeoJson((gj: GeoJsonFeature) => {
          if (targetUnit && normalizeUnit(unit) === targetUnit) {
            const positions: { lat: number; lng: number }[] = [];
            collectPositions((gj.geometry as { coordinates?: unknown })?.coordinates, positions);
            positions.forEach((p) => targetBounds.extend(p));
            map.data.overrideStyle(feature, {
              strokeWeight: 3.5,
              strokeColor: "#ffffff",
              fillOpacity: 0.2,
            });
          }

          try {
            const pt = pointOnFeature(gj);
            const [lng, lat] = pt.geometry.coordinates;
            const marker = new window.google.maps.Marker({
              position: { lat, lng },
              map,
              clickable: false,
              visible: (map.getZoom() ?? INITIAL_ZOOM) >= LABEL_MIN_ZOOM,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 0,
                fillOpacity: 0,
                strokeOpacity: 0,
              },
              label: {
                text: unit,
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: "700",
                className: "gmu-unit-label",
              },
            });
            labelMarkersRef.current.push(marker);
          } catch (err) {
            console.warn("Label placement failed for unit", unit, err);
          }
        });
      };

      map.data.addListener("addfeature", (e: GoogleMapFeatureEvent) => addLabelForFeature(e.feature));

      const updateLabelVisibility = () => {
        const visible = (map.getZoom() ?? INITIAL_ZOOM) >= LABEL_MIN_ZOOM;
        labelMarkersRef.current.forEach((m) => m.setVisible(visible));
      };
      map.addListener("zoom_changed", updateLabelVisibility);

      // Public lands overlay layer
      const publicLandsLayer = new window.google.maps.Data();
      publicLandsLayer.setMap(map);
      publicLandsLayer.setStyle((feature: GoogleMapFeature) => {
        const landType = String(feature.getProperty?.("Land_Type") ?? "");
        const colors = LAND_COLORS[landType] ?? { fill: "#9ca3af", stroke: "#6b7280" };
        return {
          fillColor: colors.fill,
          fillOpacity: 0.25,
          strokeColor: colors.stroke,
          strokeOpacity: 0.9,
          strokeWeight: 1,
        };
      });

      Promise.all([
        loadSanitizedGeoJson(map.data, "/data/colorado_gmu.geojson"),
        loadSanitizedGeoJson(publicLandsLayer, "/data/colorado_public_lands.geojson"),
      ])
        .then(() => {
          updateLabelVisibility();
          setStatus("ready");
        })
        .catch((err) => {
          console.error("Map data failed to load", err);
          setStatus("error");
          setErrorMsg("Failed to load map boundary data.");
        });
    };

    // If the API is already loaded, just init.
    if (window.google?.maps) {
      initMap();
      return;
    }

    window.initUnitMap = initMap;

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-google-maps-loader="unit-map"]'
    );
    if (existing) return;

    const script = document.createElement("script");
    const params = new URLSearchParams({
      key: GOOGLE_MAPS_BROWSER_KEY,
      loading: "async",
      callback: "initUnitMap",
      v: "weekly",
    });
    if (GOOGLE_MAPS_CHANNEL) params.set("channel", GOOGLE_MAPS_CHANNEL);
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMapsLoader = "unit-map";
    script.onerror = () => {
      setStatus("error");
      setErrorMsg("Failed to load Google Maps.");
    };
    document.head.appendChild(script);

    return () => {
      labelMarkersRef.current.forEach((m) => m.setMap(null));
      labelMarkersRef.current = [];
      if (window.gm_authFailure) {
        window.gm_authFailure = undefined;
      }
    };
  }, []);

  return (
    <>
      <SEOHead
        title="Colorado GMU Map | TalloTags"
        description="Interactive satellite map of Colorado Game Management Unit boundaries with public land overlays."
      />
      <style>{`
        .gmu-unit-label {
          text-shadow:
            -1px -1px 0 #000,
             1px -1px 0 #000,
            -1px  1px 0 #000,
             1px  1px 0 #000,
             0    0   3px rgba(0,0,0,0.85);
          pointer-events: none;
        }
      `}</style>
      <div className="w-full" style={{ height: "calc(100vh - 4rem)" }}>
        <div className="relative w-full h-full">
          <div ref={mapRef} className="w-full h-full" />
          {status === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-background/80 px-4 py-2 rounded-md text-sm text-foreground shadow">
                Loading map…
              </div>
            </div>
          )}
          {status === "error" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-background px-4 py-3 rounded-md text-sm text-destructive shadow border border-border max-w-md text-center">
                {errorMsg}
              </div>
            </div>
          )}
          {status === "ready" && (
            <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm border border-border rounded-md shadow p-3 text-xs space-y-2">
              <div className="font-semibold text-foreground">Public Lands</div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: LAND_COLORS["National Forest"].fill }} />
                <span className="text-foreground">National Forest</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: LAND_COLORS["BLM"].fill }} />
                <span className="text-foreground">BLM</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: LAND_COLORS["State Land"].fill }} />
                <span className="text-foreground">State Land</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UnitMap;
