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

type GeoJsonFeature = Feature<Geometry, GeoJsonProperties>;
type GoogleMapFeature = {
  getProperty?: (name: string) => unknown;
  toGeoJson: (callback: (feature: GeoJsonFeature) => void) => void;
};
type GoogleMapFeatureEvent = { feature: GoogleMapFeature; latLng?: unknown };
type GoogleMarker = { setVisible: (visible: boolean) => void; setMap: (map: null) => void };
type GoogleMapData = {
  setStyle: (style: Record<string, unknown>) => void;
  addListener: (eventName: string, handler: (event: GoogleMapFeatureEvent) => void) => void;
  overrideStyle: (feature: GoogleMapFeature, style: Record<string, unknown>) => void;
  revertStyle: () => void;
  loadGeoJson: (url: string, options: unknown, callback: () => void) => void;
};
type GoogleMap = {
  data: GoogleMapData;
  getZoom: () => number | undefined;
  addListener: (eventName: string, handler: () => void) => void;
};
type GoogleMapsNamespace = {
  maps: {
    Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMap;
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
    google?: GoogleMapsNamespace;
  }
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

const UnitMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<GoogleMap | null>(null);
  const labelMarkersRef = useRef<GoogleMarker[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (!GOOGLE_MAPS_BROWSER_KEY) {
      setStatus("error");
      setErrorMsg("Google Maps browser key is not configured.");
      return;
    }

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

      map.data.setStyle({
        fillColor: primaryColor,
        fillOpacity: 0.08,
        strokeColor: boundaryColor,
        strokeOpacity: 0.95,
        strokeWeight: 1.6,
      });

      map.data.addListener("mouseover", (e: any) => {
        map.data.overrideStyle(e.feature, { strokeWeight: 3, fillOpacity: 0.18 });
      });
      map.data.addListener("mouseout", () => {
        map.data.revertStyle();
      });

      const infoWindow = new window.google.maps.InfoWindow();
      map.data.addListener("click", (e: any) => {
        const unit = pickUnitNumberFromFeature(e.feature);
        if (!unit) return;
        infoWindow.setContent(
          `<div style="font-family:sans-serif;font-weight:600;color:#222;">Unit ${unit}</div>`
        );
        infoWindow.setPosition(e.latLng);
        infoWindow.open(map);
      });

      const addLabelForFeature = (feature: any) => {
        const unit = pickUnitNumberFromFeature(feature);
        if (!unit) return;
        feature.toGeoJson((gj: any) => {
          try {
            const pt = pointOnFeature(gj as any);
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

      map.data.addListener("addfeature", (e: any) => addLabelForFeature(e.feature));

      const updateLabelVisibility = () => {
        const visible = (map.getZoom() ?? INITIAL_ZOOM) >= LABEL_MIN_ZOOM;
        labelMarkersRef.current.forEach((m) => m.setVisible(visible));
      };
      map.addListener("zoom_changed", updateLabelVisibility);

      // Load boundaries
      map.data.loadGeoJson(
        "/data/colorado_gmu.geojson",
        null,
        () => {
          updateLabelVisibility();
          setStatus("ready");
        }
      );
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
    };
  }, []);

  return (
    <>
      <SEOHead
        title="Colorado GMU Map | TalloTags"
        description="Interactive satellite map of Colorado Game Management Unit boundaries with unit numbers."
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
        </div>
      </div>
    </>
  );
};

export default UnitMap;
