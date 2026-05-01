'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, AlertTriangle, ShieldCheck, IndianRupee, Navigation, ZoomIn, ZoomOut, Maximize2, Crosshair } from 'lucide-react';

// ── Indian district coordinates (all actual districts in database) ──
const DISTRICT_COORDS = {
  'Jhansi': [25.4484, 78.5685],
  'Lucknow': [26.8467, 80.9462],
  'Varanasi': [25.3176, 82.9739],
  'Agra': [27.1767, 78.0081],
  'Kanpur': [26.4499, 80.3319],
  'Patna': [25.6093, 85.1236],
  'Muzaffarpur': [26.1209, 85.3647],
  'Gaya': [24.7914, 85.0002],
  'Ranchi': [23.3441, 85.3096],
  'Bhopal': [23.2599, 77.4126],
  'Indore': [22.7196, 75.8577],
  'Jaipur': [26.9124, 75.7873],
  'Delhi': [28.6139, 77.2090],
  'Mumbai': [19.0760, 72.8777],
  'Chennai': [13.0827, 80.2707],
  'Kolkata': [22.5726, 88.3639],
  'Bangalore': [12.9716, 77.5946],
  'Bengaluru': [12.9716, 77.5946],
  'Hyderabad': [17.3850, 78.4867],
  'Ahmedabad': [23.0225, 72.5714],
  'Pune': [18.5204, 73.8567],
  'Surat': [21.1702, 72.8311],
  'Nagpur': [21.1458, 79.0882],
  'Dehradun': [30.3165, 78.0322],
  'Shimla': [31.1048, 77.1734],
  'Chandigarh': [30.7333, 76.7794],
  'Thiruvananthapuram': [8.5241, 76.9366],
  'Guwahati': [26.1445, 91.7362],
  'Bhubaneswar': [20.2961, 85.8245],
  'Raipur': [21.2514, 81.6296],
  // Districts from database that were previously missing
  'Palamu': [24.0271, 84.0531],
  'Purnea': [25.7771, 87.4753],
  'Shivpuri': [25.4236, 77.6600],
  'Kalaburagi': [17.3297, 76.8343],
  'Coimbatore': [11.0168, 76.9558],
};

// India bounding box — all markers must stay within these limits
const INDIA_BOUNDS = { latMin: 8.0, latMax: 35.0, lngMin: 68.0, lngMax: 97.0 };

function clampToIndia(lat, lng) {
  return [
    Math.max(INDIA_BOUNDS.latMin, Math.min(INDIA_BOUNDS.latMax, lat)),
    Math.max(INDIA_BOUNDS.lngMin, Math.min(INDIA_BOUNDS.lngMax, lng)),
  ];
}

function getCoords(districtName, index) {
  const name = (districtName || '').toLowerCase();
  for (const [key, coords] of Object.entries(DISTRICT_COORDS)) {
    if (name.includes(key.toLowerCase()) || key.toLowerCase().includes(name)) {
      // Circular offset for overlapping markers (fan out, not linear drift)
      const angle = (index * 137.508) * (Math.PI / 180); // golden angle spread
      const radius = 0.04 + (index * 0.008); // small expanding radius
      const offsetLat = Math.cos(angle) * radius;
      const offsetLng = Math.sin(angle) * radius;
      return clampToIndia(coords[0] + offsetLat, coords[1] + offsetLng);
    }
  }
  // Fallback: place inside central India (not random outside borders)
  const fallbackLat = 18 + (Math.random() * 10); // 18°N to 28°N
  const fallbackLng = 74 + (Math.random() * 8);  // 74°E to 82°E
  return [fallbackLat, fallbackLng];
}

function getRiskColor(score) {
  if (score <= 30) return '#10b981';
  if (score <= 60) return '#f59e0b';
  return '#ef4444';
}

function getRiskBg(score) {
  if (score <= 30) return 'rgba(16,185,129,0.12)';
  if (score <= 60) return 'rgba(245,158,11,0.12)';
  return 'rgba(239,68,68,0.12)';
}

function getRiskLabel(score) {
  if (score <= 30) return 'LOW';
  if (score <= 60) return 'MEDIUM';
  return 'HIGH';
}

export default function ProjectMap({ projects = [], onSelectProject }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  // Fly to a project marker
  const flyToProject = useCallback((project, index) => {
    if (!mapInstance.current) return;
    const coords = getCoords(project.districts?.name, index);
    mapInstance.current.flyTo(coords, 10, { duration: 1.2, easeLinearity: 0.25 });
    setSelectedId(project.id);

    // Open popup of matching marker
    const marker = markersRef.current.find(m => m._projectId === project.id);
    if (marker) marker.openPopup();
  }, []);

  // Reset to full view
  const resetView = useCallback(() => {
    if (!mapInstance.current || markersRef.current.length === 0) return;
    const L = window._leafletLib;
    if (!L) return;
    const group = L.featureGroup(markersRef.current);
    mapInstance.current.fitBounds(group.getBounds().pad(0.15), { duration: 0.8 });
    setSelectedId(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      window._leafletLib = L;

      if (cancelled) return;

      // Clear existing markers
      if (mapInstance.current) {
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];
      }

      // Initialize map
      if (!mapInstance.current && mapRef.current) {
        // India bounds for restricting pan/zoom
        const indiaSW = L.latLng(6.0, 67.0);
        const indiaNE = L.latLng(36.0, 98.0);
        const indiaBounds = L.latLngBounds(indiaSW, indiaNE);

        mapInstance.current = L.map(mapRef.current, {
          center: [22.5, 80],
          zoom: 5,
          scrollWheelZoom: true,
          zoomControl: false, // We use custom controls
          attributionControl: false,
          minZoom: 4,
          maxZoom: 16,
          maxBounds: indiaBounds,
          maxBoundsViscosity: 0.9, // Elastic pull back into bounds
        });

        // Premium dark map tile (CartoDB Voyager — clean professional style)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; CARTO',
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(mapInstance.current);

        // Small attribution
        L.control.attribution({ position: 'bottomleft', prefix: false })
          .addAttribution('© <a href="https://carto.com/" target="_blank">CARTO</a> · © <a href="https://www.openstreetmap.org/" target="_blank">OSM</a>')
          .addTo(mapInstance.current);

        setMapReady(true);
      }

      const map = mapInstance.current;

      // ── Add markers ──
      projects.forEach((project, i) => {
        const districtName = project.districts?.name || '';
        const coords = getCoords(districtName, i);
        const riskScore = project.risk_score || 0;
        const color = getRiskColor(riskScore);
        const riskLabel = getRiskLabel(riskScore);
        const contractValue = Number(project.contract_value_cr || 0);
        const isFlagged = project.status === 'flagged';

        // Animated marker with pulse ring
        const icon = L.divIcon({
          className: 'ct-marker',
          html: `
            <div class="ct-marker-wrap" data-risk="${riskLabel.toLowerCase()}">
              <div class="ct-marker-pulse" style="background: ${color};"></div>
              <div class="ct-marker-dot" style="background: ${color}; border-color: ${color};">
                <span>${riskScore}</span>
              </div>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
          popupAnchor: [0, -22],
        });

        const marker = L.marker(coords, {
          icon,
          riseOnHover: true,
          riseOffset: 250,
        }).addTo(map);

        marker._projectId = project.id;

        // Premium popup
        marker.bindPopup(`
          <div class="ct-popup">
            <div class="ct-popup-header" style="border-bottom-color: ${color}20;">
              <div class="ct-popup-status" style="background: ${getRiskBg(riskScore)}; color: ${color};">
                ${isFlagged ? '⚠' : '✓'} ${project.status?.toUpperCase() || 'UNKNOWN'}
              </div>
              <div class="ct-popup-risk" style="color: ${color};">${riskScore}<span>/100</span></div>
            </div>
            <h3 class="ct-popup-title">${project.name}</h3>
            <div class="ct-popup-location">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              ${districtName || 'Unknown'}, ${project.districts?.state || 'India'}
            </div>
            <div class="ct-popup-divider"></div>
            <div class="ct-popup-grid">
              <div class="ct-popup-metric">
                <span class="ct-popup-metric-label">Contract Value</span>
                <span class="ct-popup-metric-value">₹${contractValue.toFixed(2)} Cr</span>
              </div>
              <div class="ct-popup-metric">
                <span class="ct-popup-metric-label">Risk Level</span>
                <span class="ct-popup-metric-value" style="color: ${color};">${riskLabel}</span>
              </div>
            </div>
            <div class="ct-popup-contractor">
              <span>Contractor</span>
              <strong>${project.contractor_name || '—'}</strong>
            </div>
          </div>
        `, {
          maxWidth: 300,
          minWidth: 260,
          className: 'ct-popup-container',
          closeButton: true,
        });

        // Hover interactivity
        marker.on('mouseover', () => setHoveredId(project.id));
        marker.on('mouseout', () => setHoveredId(null));
        marker.on('click', () => setSelectedId(project.id));

        markersRef.current.push(marker);
      });

      // Fit bounds
      if (markersRef.current.length > 0) {
        const group = L.featureGroup(markersRef.current);
        map.fitBounds(group.getBounds().pad(0.15));
      }
    };

    init();

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        setMapReady(false);
      }
    };
  }, [projects]);

  // Custom zoom controls
  const zoomIn = () => mapInstance.current?.zoomIn();
  const zoomOut = () => mapInstance.current?.zoomOut();

  const totalFlagged = projects.filter(p => p.status === 'flagged').length;
  const avgRisk = projects.length
    ? Math.round(projects.reduce((s, p) => s + (p.risk_score || 0), 0) / projects.length)
    : 0;

  return (
    <div className="ct-map-layout">
      {/* ── Sidebar: Project List ── */}
      <div className="ct-map-sidebar">
        <div className="ct-map-sidebar-header">
          <h3>Projects</h3>
          <span className="ct-map-count">{projects.length}</span>
        </div>

        {/* Quick Stats */}
        <div className="ct-map-quick-stats">
          <div className="ct-map-qstat">
            <span className="ct-map-qstat-val" style={{ color: 'var(--color-red-600)' }}>{totalFlagged}</span>
            <span className="ct-map-qstat-label">Flagged</span>
          </div>
          <div className="ct-map-qstat-divider"></div>
          <div className="ct-map-qstat">
            <span className="ct-map-qstat-val" style={{ color: getRiskColor(avgRisk) }}>{avgRisk}</span>
            <span className="ct-map-qstat-label">Avg Risk</span>
          </div>
          <div className="ct-map-qstat-divider"></div>
          <div className="ct-map-qstat">
            <span className="ct-map-qstat-val" style={{ color: 'var(--color-primary-600)' }}>{projects.length}</span>
            <span className="ct-map-qstat-label">Total</span>
          </div>
        </div>

        {/* Scrollable project list */}
        <div className="ct-map-list">
          {projects.map((project, i) => {
            const riskScore = project.risk_score || 0;
            const color = getRiskColor(riskScore);
            const isActive = selectedId === project.id;
            const isHovered = hoveredId === project.id;

            return (
              <button
                key={project.id}
                className={`ct-map-item ${isActive ? 'ct-map-item-active' : ''} ${isHovered ? 'ct-map-item-hover' : ''}`}
                onClick={() => flyToProject(project, i)}
              >
                <div className="ct-map-item-indicator" style={{ background: color }}></div>
                <div className="ct-map-item-content">
                  <div className="ct-map-item-name">{project.name}</div>
                  <div className="ct-map-item-meta">
                    <MapPin size={11} />
                    <span>{project.districts?.name || 'N/A'}</span>
                    <span className="ct-map-item-dot">·</span>
                    <span style={{ color, fontWeight: 600 }}>Risk {riskScore}</span>
                  </div>
                </div>
                <div className="ct-map-item-badge" style={{ background: getRiskBg(riskScore), color }}>
                  {riskScore}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Map Container ── */}
      <div className="ct-map-main">
        <div ref={mapRef} className="ct-map-canvas" />

        {/* Custom Zoom Controls */}
        <div className="ct-map-controls">
          <button className="ct-map-ctrl" onClick={zoomIn} title="Zoom in">
            <ZoomIn size={16} />
          </button>
          <button className="ct-map-ctrl" onClick={zoomOut} title="Zoom out">
            <ZoomOut size={16} />
          </button>
          <div className="ct-map-ctrl-divider"></div>
          <button className="ct-map-ctrl" onClick={resetView} title="Fit all projects">
            <Maximize2 size={15} />
          </button>
        </div>

        {/* Legend */}
        <div className="ct-map-legend">
          <div className="ct-map-legend-title">Risk Level</div>
          <div className="ct-map-legend-items">
            <div className="ct-map-legend-item">
              <span className="ct-map-legend-dot" style={{ background: '#10b981' }}></span>
              <span>Low ≤30</span>
            </div>
            <div className="ct-map-legend-item">
              <span className="ct-map-legend-dot" style={{ background: '#f59e0b' }}></span>
              <span>Medium 31-60</span>
            </div>
            <div className="ct-map-legend-item">
              <span className="ct-map-legend-dot" style={{ background: '#ef4444' }}></span>
              <span>High 61+</span>
            </div>
          </div>
        </div>

        {/* Info overlay when a project is selected */}
        {selectedId && (
          <div className="ct-map-selection-bar">
            <Crosshair size={14} />
            <span>
              Viewing: <strong>{projects.find(p => p.id === selectedId)?.name || 'Project'}</strong>
            </span>
            <button className="ct-map-selection-reset" onClick={resetView}>
              Show all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
