'use client';

import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

const geoUrl = "https://raw.githubusercontent.com/rowanhogan/australian-states/master/states.geojson";

export default function GeospatialMap({ data }: { data: any[] }) {
  const [geoData, setGeoData] = useState<any[] | null>(null);
  const [mapError, setMapError] = useState(false);
  const [tooltip, setTooltip] = useState({ show: false, content: '', x: 0, y: 0 });

  useEffect(() => {
    fetch(geoUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Network blocked the map download");
        return res.json();
      })
      .then((jsonData) => {
        // THE FIX: If it is GeoJSON, extract the features array so react-simple-maps 
        // doesn't try to parse it as TopoJSON and crash on Object.keys().
        if (jsonData && jsonData.type === "FeatureCollection" && jsonData.features) {
          setGeoData(jsonData.features);
        } else {
          setGeoData(jsonData);
        }
      })
      .catch((err) => {
        console.error("Map fetch failed:", err);
        setMapError(true);
      });
  }, []);

  const stateData = (data || []).reduce((acc, curr) => {
    if (curr && curr.state) {
      const stateName = curr.state.toLowerCase().trim();
      acc[stateName] = curr.count || 0;
      
      if (stateName === 'nsw') acc['new south wales'] = curr.count;
      if (stateName === 'vic') acc['victoria'] = curr.count;
      if (stateName === 'qld') acc['queensland'] = curr.count;
      if (stateName === 'wa') acc['western australia'] = curr.count;
      if (stateName === 'sa') acc['south australia'] = curr.count;
      if (stateName === 'tas') acc['tasmania'] = curr.count;
      if (stateName === 'nt') acc['northern territory'] = curr.count;
      if (stateName === 'act') acc['australian capital territory'] = curr.count;
    }
    return acc;
  }, {} as Record<string, number>);

  const maxCount = Math.max(...(data || []).map(d => d.count || 0), 1);

  const getColor = (stateName: string) => {
    const count = stateData[stateName.toLowerCase()] || 0;
    if (count === 0) return "#1e293b"; 
    
    const intensity = 0.2 + (count / maxCount) * 0.8; 
    return `rgba(99, 102, 241, ${intensity})`; 
  };

  if (mapError) {
    return (
      <div className="w-full h-full min-h-[380px] bg-[#0b1120] flex flex-col items-center justify-center rounded-b-2xl text-slate-500 space-y-2 border border-slate-800">
        <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        <p className="text-sm font-medium">Map data blocked by network/browser</p>
      </div>
    );
  }

  if (!geoData) {
    return (
      <div className="w-full h-full min-h-[380px] bg-[#0b1120] flex items-center justify-center rounded-b-2xl">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[380px] bg-[#0b1120] flex items-center justify-center relative rounded-b-2xl overflow-hidden">
      
      <ComposableMap 
        projection="geoMercator" 
        projectionConfig={{ scale: 750, center: [134, -28] }} 
        className="w-full h-full outline-none"
      >
        <ZoomableGroup zoom={1} center={[134, -28]} maxZoom={1}>
          {/* We are now passing the safe Array directly to the component */}
          <Geographies geography={geoData}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const stateName = geo.properties.STATE_NAME || "Unknown";
                const count = stateData[stateName.toLowerCase()] || 0;
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getColor(stateName)}
                    stroke="#334155"
                    strokeWidth={1}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#818cf8", outline: "none", cursor: "pointer", transition: "all 0.2s" },
                      pressed: { outline: "none" },
                    }}
                    onMouseEnter={(e) => {
                      setTooltip({
                        show: true,
                        content: `${stateName}: ${count} Leads`,
                        x: e.clientX,
                        y: e.clientY
                      });
                    }}
                    onMouseMove={(e) => {
                      setTooltip(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
                    }}
                    onMouseLeave={() => {
                      setTooltip(prev => ({ ...prev, show: false }));
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      
      {tooltip.show && (
        <div 
          className="fixed z-50 pointer-events-none bg-slate-800 text-slate-100 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 shadow-xl transition-opacity duration-150"
          style={{ 
            left: `${tooltip.x + 15}px`, 
            top: `${tooltip.y + 15}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {tooltip.content}
        </div>
      )}
      
    </div>
  );
}