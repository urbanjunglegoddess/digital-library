# Map/Location (Full Build)

# The Map/Location: A Senior Engineer's Complete Breakdown
The interactive map container with pins, controls, and info windows. Here's everything from first principles to production code.

**Try it live:** the interactive playground (built in a later pass) will let you configure pin styles, control placement, info window content, and map provider, then output code for every target.

**Audit a map:** the companion audit checks control labeling, keyboard navigation, text alternative, skip link, and pin focus management, then exports a client-ready report.

This doc follows the ⭐ COMPONENT ASSET TEMPLATE (follow this) ([https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531](https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531)) and its visual styles are drawn from the 🎨 Design Styles (visual languages) ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).
* * *

## 1\. What a Map Component Actually Is
A **map component** is an interactive geographical view with markers/pins, zoom/pan controls, and information popups. It wraps a map tile provider (Google Maps, Mapbox, Leaflet/OpenStreetMap) with your design system's controls and styling.

As a component library asset, the "map" is the **UI frame**: the control buttons, pin designs, info window styling, loading/error states, and accessibility patterns. The actual tile rendering comes from the provider.

**Map (this doc):** interactive geographical view with custom UI overlay.
**Static map image:** a non-interactive screenshot of a map (Google Static Maps API). Simpler, lighter, but no interaction.
**Location picker (form):** an input for selecting an address/coordinates. Uses a map as the picker UI but is fundamentally a form input.
**Directions/Routing:** a specialized map showing a route between points. A use case of the map component.
* * *

## 2\. Why It Matters
**Location context is irreplaceable.** Store locators, delivery tracking, real estate listings, event venues, travel apps. When "where" matters, a map is the natural visualization.

**Accessibility is the deepest challenge.** Maps are inherently visual and spatial. A screen-reader user cannot "see" where pins are relative to each other. The component must provide equivalent non-visual access to the information the map conveys.

**Performance impact.** Map libraries are heavy (Google Maps JS API: ~200KB, Mapbox GL: ~200KB). Lazy-loading, viewport-triggered loading, and placeholder images are critical.
* * *

## 3\. Anatomy
**Map container:** the viewport showing map tiles. Fixed dimensions or responsive.
**Pins/Markers:** location indicators placed at coordinates. Can be default pins, custom icons, or numbered markers.
**Info windows/Popups:** content panels that open when clicking a pin. Show details (name, address, hours, actions).
**Zoom controls:** +/- buttons. Also: scroll-zoom, pinch-zoom.
**Pan controls (optional):** directional arrows. Most users pan with drag.
**Locate me button:** centers the map on the user's current GPS position.
**Search overlay (optional):** a location search input positioned over the map.
**Legend (optional):** color/icon key for marker categories.
**Cluster indicators:** when many pins overlap at a zoom level, merge into a numbered cluster circle.
**Loading state:** placeholder (static map image or skeleton) while tiles load.
**Error state:** "Map couldn't load" with retry or fallback address list.
* * *

## 4\. Sizes / Scale

| Token | Min Height | Use |
| ---| ---| --- |
| S | 200px | Inline card, contact section |
| M | 300px | Default embedded map |
| L | 400-500px | Feature map, store locator |
| Full | 100vh | Full-page map (mobile apps, real estate) |

Width: 100% parent (fluid). Full-page maps have controls overlaid.

Control button size: 36-44px (must meet 44px touch target requirement).
* * *

## 5\. States
**Loading:** tiles haven't loaded. Show a skeleton, static map image, or branded loading state.
**Loaded/Idle:** map tiles visible, controls ready, pins placed.
**Panning:** user is dragging the map. Cursor changes.
**Zooming:** user is zooming (scroll, pinch, buttons). Tiles may reload at new zoom level.
**Marker hover:** a pin is hovered. May show a tooltip or visual emphasis.
**Info window open:** a pin was clicked. Info window/popup visible with content.
**User location tracking:** blue dot showing user's GPS position (with accuracy circle).
**Clustered:** many pins merged into cluster indicators at current zoom.
**Error (provider failure):** map tiles can't load (CDN down, API key invalid). Error message with fallback.
**Error (geolocation denied):** user denied location permission. Show message, still allow manual search.
* * *

## 6\. Types / Variants
**Standard interactive:** pan, zoom, click pins. The default.
**Static display:** non-interactive image. For directions confirmation, email embeds.
**Store locator:** map + sidebar list of locations. Clicking list item highlights pin and vice versa.
**Directions/Route:** showing a path between A and B with turn-by-turn.
**Heatmap:** density visualization (foot traffic, incidents).
**Geofence:** showing a boundary area on the map.
**Minimap:** small fixed map in a card (contact us, event location). Often static or minimally interactive.
**Full-page with sidebar:** map fills the viewport; sidebar overlays with list/filters (Airbnb, Zillow style).
**Satellite/Terrain toggle:** switching tile layers.
* * *

## 7\. When to Use (and When Not To)
**Use a map when:**
*   Spatial/geographical context matters
*   Users need to understand relative positions of locations
*   Location selection benefits from visual context
*   Showing routes, areas, or geographic patterns

**Use something else when:**
*   Listing locations by name/distance → a sorted list is clearer and more accessible
*   The map would have only one pin → consider a static image with an address
*   Mobile data/performance is constrained → static map image or address only
*   The spatial relationship doesn't matter to the use case
* * *

## 8\. Across Design Systems
**Google Maps Platform:** Maps JavaScript API. The default for most web apps. `@googlemaps/react-wrapper` for React.
**Mapbox GL JS:** vector tiles, highly customizable styling, 3D terrain. `react-map-gl` for React.
**Leaflet:** open-source, lightweight (~40KB), uses raster tiles (OpenStreetMap by default). `react-leaflet` for React.
**Apple MapKit JS:** Apple Maps for web. Good on Apple devices.
**Azure Maps / HERE Maps:** enterprise alternatives.

For React specifically:
*   **react-google-maps (@vis.gl/react-google-maps):** official Google wrapper
*   **react-map-gl:** Mapbox/MapLibre wrapper by Uber
*   **react-leaflet:** Leaflet wrapper
* * *

## 9\. The Code
### 9.1 HTML (structure with accessible controls)

```plain
<div class="map-component" role="region" aria-label="Store locations map">
  <!-- Skip link -->
  <a href="#map-list" class="skip-link">Skip map, view location list</a>

  <!-- Map viewport -->
  <div id="map" class="map-viewport" role="application" aria-label="Interactive map" tabindex="0"
       aria-describedby="map-instructions">
    <!-- Map tiles rendered by provider -->
  </div>
  <span id="map-instructions" class="sr-only">
    Interactive map. Use arrow keys to pan, plus and minus to zoom.
  </span>

  <!-- Custom controls overlay -->
  <div class="map-controls" aria-label="Map controls">
    <button type="button" class="map-btn" aria-label="Zoom in">+</button>
    <button type="button" class="map-btn" aria-label="Zoom out">&minus;</button>
    <button type="button" class="map-btn" aria-label="Show my location">
      <svg aria-hidden="true"><!-- locate icon --></svg>
    </button>
  </div>

  <!-- Info window (when a pin is clicked) -->
  <div class="map-info" role="dialog" aria-label="Location details" hidden>
    <button class="map-info__close" aria-label="Close">&times;</button>
    <h3 class="map-info__name">UJG Headquarters</h3>
    <p class="map-info__address">123 Peachtree St, Atlanta, GA 30303</p>
    <a href="https://maps.google.com/..." class="map-info__directions">Get directions</a>
  </div>

  <!-- Accessible alternative: location list -->
  <div id="map-list" class="map-list">
    <h3>Locations</h3><ul>
      <li><a href="#">UJG Headquarters</a> — 123 Peachtree St, Atlanta, GA 30303</li>
      <li><a href="#">Satellite Office</a> — 456 Oak Ave, Savannah, GA 31401</li>
    </ul>
  </div>
</div>
```

Key decisions:
*   **`role="application"`** on the map viewport. This tells AT to pass all keystrokes to the map (arrow keys pan instead of scrolling the page). Use cautiously.
*   **Skip link** before the map. Keyboard users can jump past the map to the location list.
*   **`aria-describedby`** with usage instructions.
*   **Info window as** **`role="dialog"`** with close button and label.
*   **Accessible alternative (location list)** below the map. Screen-reader users get the same information without needing to interact with the map.
### 9.2 React (Leaflet)

```typescript
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LatLng } from 'leaflet';

interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface MapProps {
  locations: Location[];
  center?: [number, number];
  zoom?: number;
}

export function LocationMap({ locations, center = [33.749, -84.388], zoom = 12 }: MapProps) {
  return (
    <div className="map-component" role="region" aria-label="Locations">
      <a href="#location-list" className="skip-link">Skip map, view list</a>

      <MapContainer center={center} zoom={zoom} className="map-viewport"
                    style={{ height: 400, width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                   attribution='&copy; OpenStreetMap contributors' />
        {locations.map(loc => (
          <Marker key={loc.id} position={[loc.lat, loc.lng]}>
            <Popup>
              <h3>{loc.name}</h3>
              <p>{loc.address}</p>
              <a href={`https://maps.google.com/?q=${loc.lat},${loc.lng}`}
                 target="_blank" rel="noopener">Get directions</a>
            </Popup>
          </Marker>
        ))}
        <LocateControl />
      </MapContainer>

      {/* Accessible alternative */}
      <div id="location-list" className="map-list">
        <h3>All Locations</h3><ul>
          {locations.map(loc => (
            <li key={loc.id}>
              <strong>{loc.name}</strong> — {loc.address}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function LocateControl() {
  const map = useMap();
  return (
    <button className="map-btn map-btn--locate" aria-label="Show my location"
            onClick={() => map.locate({ setView: true, maxZoom: 15 })}>
      <LocateIcon />
    </button>
  );
}
```

### 9.3 React (Google Maps)

```typescript
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';

export function GoogleLocationMap({ locations, apiKey }: { locations: Location[]; apiKey: string }) {
  const [selected, setSelected] = useState<Location | null>(null);

  return (
    <div role="region" aria-label="Locations">
      <a href="#location-list" className="skip-link">Skip map</a>
      <APIProvider apiKey={apiKey}>
        <Map defaultCenter={{ lat: 33.749, lng: -84.388 }} defaultZoom={12}
             style={{ height: 400, width: '100%' }}>
          {locations.map(loc => (
            <AdvancedMarker key={loc.id} position={{ lat: loc.lat, lng: loc.lng }}
                           onClick={() => setSelected(loc)} />
          ))}
          {selected && (
            <InfoWindow position={{ lat: selected.lat, lng: selected.lng }}
                        onCloseClick={() => setSelected(null)}>
              <h3>{selected.name}</h3>
              <p>{selected.address}</p>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
      <div id="location-list"><ul>{locations.map(l => <li key={l.id}>{l.name}: {l.address}</li>)}</ul></div>
    </div>
  );
}
```

### 9.4 SwiftUI (MapKit)

```swift
import SwiftUI
import MapKit

struct LocationMapView: View {
    let locations: [MapLocation]
    @State private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 33.749, longitude: -84.388),
        span: MKCoordinateSpan(latitudeDelta: 0.1, longitudeDelta: 0.1)
    )
    @State private var selectedLocation: MapLocation?

    var body: some View {
        VStack(spacing: 0) {
            // Map
            Map(coordinateRegion: $region, annotationItems: locations) { location in
                MapAnnotation(coordinate: location.coordinate) {
                    Button(action: { selectedLocation = location }) {
                        Image(systemName: "mappin.circle.fill")
                            .font(.title)
                            .foregroundColor(.purple)
                    }
                    .accessibilityLabel(location.name)
                }
            }
            .frame(height: 400)
            .cornerRadius(12)

            // Info panel
            if let selected = selectedLocation {
                VStack(alignment: .leading, spacing: 8) {
                    Text(selected.name).font(.headline)
                    Text(selected.address).font(.subheadline).foregroundColor(.secondary)
                    Link("Get directions", destination: URL(string: "maps://?daddr=\\(selected.coordinate.latitude),\\(selected.coordinate.longitude)")!)
                }
                .padding()
                .background(RoundedRectangle(cornerRadius: 8).fill(Color(.systemGray6)))
                .padding()
            }

            // Accessible list alternative
            List(locations) { loc in
                VStack(alignment: .leading) {
                    Text(loc.name).font(.subheadline).fontWeight(.semibold)
                    Text(loc.address).font(.caption).foregroundColor(.secondary)
                }
            }
            .frame(height: 200)
            .accessibilityLabel("Location list")
        }
    }
}

struct MapLocation: Identifiable {
    let id: String
    let name: String
    let address: String
    let coordinate: CLLocationCoordinate2D
}
```

### 9.5 Jetpack Compose (Google Maps)

```kotlin
import com.google.maps.android.compose.*
import com.google.android.gms.maps.model.LatLng

@Composable
fun LocationMap(locations: List<MapLocation>) {
    var selectedLocation by remember { mutableStateOf<MapLocation?>(null) }
    val cameraPositionState = rememberCameraPositionState { position = CameraPosition.fromLatLngZoom(LatLng(33.749, -84.388), 12f) }

    Column {
        // Map
        GoogleMap(
            modifier = Modifier.fillMaxWidth().height(400.dp).clip(RoundedCornerShape(12.dp)),
            cameraPositionState = cameraPositionState
        ) {
            locations.forEach { loc ->
                Marker(
                    state = MarkerState(position = LatLng(loc.lat, loc.lng)),
                    title = loc.name,
                    snippet = loc.address,
                    onClick = { selectedLocation = loc; true }
                )
            }
        }

        // Info window
        selectedLocation?.let { loc ->
            Card(modifier = Modifier.padding(16.dp).fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(loc.name, style = MaterialTheme.typography.titleMedium)
                    Text(loc.address, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    TextButton(onClick = { /* open directions */ }) { Text("Get directions") }
                }
            }
        }

        // Accessible list alternative
        Text("Locations", style = MaterialTheme.typography.titleSmall, modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp))
        locations.forEach { loc ->
            ListItem(
                headlineContent = { Text(loc.name) },
                supportingContent = { Text(loc.address) },
                modifier = Modifier.semantics { contentDescription = "${loc.name}, ${loc.address}" }
            )
        }
    }
}

data class MapLocation(val id: String, val name: String, val address: String, val lat: Double, val lng: Double)
```

### 9.6 Flutter (google\_maps\_flutter)

```dart
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class LocationMapWidget extends StatefulWidget {
  final List<MapLocation> locations;
  const LocationMapWidget({super.key, required this.locations});
  @override State<LocationMapWidget> createState() => _LocationMapWidgetState();
}

class _LocationMapWidgetState extends State<LocationMapWidget> {
  GoogleMapController? _controller;
  MapLocation? _selected;

  Set<Marker> get _markers => widget.locations.map((loc) => Marker(
    markerId: MarkerId(loc.id),
    position: LatLng(loc.lat, loc.lng),
    infoWindow: InfoWindow(title: loc.name, snippet: loc.address),
    onTap: () => setState(() => _selected = loc),
  )).toSet();

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Location map',
      child: Column(children: [
        // Map
        SizedBox(
          height: 400,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: GoogleMap(
              initialCameraPosition: const CameraPosition(target: LatLng(33.749, -84.388), zoom: 12),
              markers: _markers,
              onMapCreated: (controller) => _controller = controller,
              myLocationButtonEnabled: true,
              zoomControlsEnabled: true,
            ),
          ),
        ),

        // Selected location info
        if (_selected != null) Card(
          margin: const EdgeInsets.all(16),
          child: ListTile(
            title: Text(_selected!.name),
            subtitle: Text(_selected!.address),
            trailing: TextButton(onPressed: () { /* open directions */ }, child: const Text('Directions')),
          ),
        ),

        // Accessible list alternative
        const Padding(padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Text('All Locations', style: TextStyle(fontWeight: FontWeight.w600))),
        ...widget.locations.map((loc) => ListTile(
          title: Text(loc.name),
          subtitle: Text(loc.address),
          dense: true,
        )),
      ]),
    );
  }
}

class MapLocation { final String id; final String name; final String address; final double lat; final double lng;
  MapLocation({required this.id, required this.name, required this.address, required this.lat, required this.lng}); }
```

### 9.7 Testing

```typescript
describe("LocationMap", () => {
  it("has a region with label", () => {
    render(<LocationMap locations={mockLocations} />);
    expect(screen.getByRole('region', { name: /locations/i })).toBeInTheDocument();
  });

  it("provides a skip link past the map", () => {
    render(<LocationMap locations={mockLocations} />);
    expect(screen.getByText(/skip map/i)).toHaveAttribute('href', '#location-list');
  });

  it("renders accessible location list", () => {
    render(<LocationMap locations={mockLocations} />);
    expect(screen.getByText(mockLocations[0].name)).toBeInTheDocument();
    expect(screen.getByText(mockLocations[0].address)).toBeInTheDocument();
  });

  it("zoom buttons have accessible labels", () => {
    render(<LocationMap locations={mockLocations} />);
    expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
  });
});
```

* * *

## 10\. Accessibility
### The fundamental problem
Maps are **inherently inaccessible.** The spatial relationship between pins ("the store is 2 blocks north of the park") cannot be conveyed non-visually through ARIA alone. The solution is NOT to make the map "accessible" in the way a button is accessible. The solution is to **provide the same information through an alternative format.**
### Required: text-based alternative
Every map MUST have a non-visual alternative that provides the same information:
*   A list of locations with addresses and links to directions
*   A text description of the area/route
*   A data table with coordinates and distances
### Skip link
A "Skip map" link before the map container. Keyboard users can bypass the interactive map entirely and reach the alternative content.
### Keyboard for map interaction
`role="application"` on the map viewport passes keyboard events to the map library. Most map libraries handle:
*   Arrow keys: pan
*   +/-: zoom
*   Enter on a marker: open info window
*   Escape: close info window
### Custom controls
Zoom buttons, locate button, and layer toggles must be:
*   Real `<button>` elements (not divs)
*   Labeled with `aria-label`
*   Keyboard-focusable
*   ≥44px touch target
*   Visible focus ring
### Info windows
`role="dialog"` with `aria-label`. Close on Escape. Focus moves into the info window on open, returns to the pin/trigger on close.
### Marker focus
If using custom markers, they should be focusable (Tab between markers, Enter to open info). Default Google/Leaflet markers are keyboard-accessible by default.
### High-contrast mode
Provider map tiles are not guaranteed to meet contrast requirements. Under forced-colors / high-contrast mode, verify that pins, control buttons, and info windows remain legible — the tiles themselves may need a high-contrast tile style or an adjusted overlay.
### Reduced motion
Disable smooth pan/zoom animations under `prefers-reduced-motion`. Map should jump to new positions instantly.
* * *

## 11\. Innovative / Emerging Ideas
*   **3D maps (Mapbox GL, Google Maps 3D):** tilted perspective with 3D buildings.
*   **Indoor maps:** floor plans for malls, airports, hospitals.
*   **Augmented reality overlay:** AR view using device camera + GPS.
*   **Voice-guided navigation:** turn-by-turn directions read aloud.
*   **Collaborative map editing:** multiple users adding/moving pins in real-time.
*   **AI-powered search:** "find coffee shops near me that are open now" with natural language.
*   **Offline maps:** cached tiles for areas with poor connectivity.
* * *

## 12\. Conversion / UX Killers
*   **No text alternative:** screen-reader users get zero information from the map.
*   **No skip link:** keyboard users must Tab through every map control and marker to get past it.
*   **Controls too small for touch:** zoom buttons under 44px.
*   **No loading state:** white rectangle for 2-3 seconds while tiles load.
*   **Error with no fallback:** map API key expires, users see a gray box. Show the address list instead.
*   **Scroll-zoom hijacking:** scrolling the page zooms the map instead. Require Ctrl+scroll for map zoom.
*   **Full-page map with no way to access content behind it:** on mobile, the map covers everything. Provide a "List view" toggle.
*   **Too many pins without clustering:** 500 pins at city zoom creates visual noise. Cluster them.
* * *

## 13\. Advanced Patterns
### Lazy-load map on scroll

```typescript
function LazyMap({ ...props }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: '200px' });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ minHeight: 400 }}>
      {visible ? <LocationMap {...props} /> : <MapPlaceholder />}
    </div>
  );
}
```

### Marker clustering

```typescript
import MarkerClusterer from '@googlemaps/markerclusterer';
// Or for Leaflet: leaflet.markercluster plugin
// Clusters pins that overlap at the current zoom level into numbered circles
```

### Geolocation with permission handling

```typescript
async function getUserLocation(): Promise<GeolocationPosition | null> {
  if (!('geolocation' in navigator)) return null;
  try {
    return await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000
      });
    });
  } catch (err) {
    if (err.code === 1) console.log('Permission denied');
    return null;
  }
}
```

* * *

## 14\. Performance & Bundle Cost
*   **Google Maps JS API: ~200KB.** Load async with `loading="async"` on the script tag.
*   **Mapbox GL JS: ~200KB.** Heavy but includes vector rendering.
*   **Leaflet: ~40KB.** The lightweight choice for simple use cases.
*   **Lazy-load the map library.** Don't include it in the initial bundle. Load when the map scrolls into view or on user interaction.
*   **Static map placeholder.** Show a static image (Google Static Maps API, screenshot) until the user interacts. Then swap to interactive. Saves initial load.
*   **Tile caching.** Map libraries cache tiles in memory. Avoid re-mounting the map component (it re-downloads tiles).
*   **Limit re-renders.** Pin position changes shouldn't re-render the entire map. Use the library's marker update API.
* * *

## 15\. Security
*   **API key protection.** Map provider API keys are exposed client-side. Use HTTP referrer restrictions and quota limits. Never use unrestricted keys.
*   **Geolocation privacy.** The user's location is sensitive. Request only when needed, don't store without consent, and explain why you need it.
*   **XSS in info windows.** If popup content includes user-generated text (place names, reviews), sanitize it.
*   **Directions data.** If calculating routes between user-supplied addresses, validate inputs. Don't allow injection into the geocoding API.
*   **Rate limiting.** Map tile requests and geocoding calls are metered. Implement client-side debounce on search/geocode to avoid hitting limits.
* * *

## 16\. Senior-Level Checklist
- [ ] Text-based alternative (location list with addresses) always provided
- [ ] Skip link before the map for keyboard users
- [ ] Custom controls are real `<button>` elements with `aria-label`
- [ ] Controls ≥44px touch target
- [ ] Info windows: `role="dialog"`, close on Escape, focus management
- [ ] Markers keyboard-focusable (Tab, Enter to open)
- [ ] `prefers-reduced-motion`: no smooth pan/zoom
- [ ] High-contrast / forced-colors mode: pins, controls, and info windows stay legible (tiles may need adjustment)
- [ ] Loading state (placeholder) before tiles load
- [ ] Error state with fallback (show addresses if map fails)
- [ ] Scroll-zoom requires modifier key (Ctrl+scroll) to prevent page hijack
- [ ] Clustering for dense markers
- [ ] Map library lazy-loaded (not in initial bundle)
- [ ] API keys restricted (HTTP referrer, quota limits)
- [ ] Geolocation permission handled gracefully (denied = no crash)
- [ ] Responsive: controls reposition on mobile
- [ ] Info window content sanitized against XSS
* * *

## 17\. Visual Styles
Map tiles themselves are provider-controlled (you can style them in Mapbox/Google with custom JSON styles). Your component library styles the **controls, pins, info windows, and overlays** around the map.

**Flat:** simple round control buttons with solid backgrounds. Pin is a solid teardrop. Info window is a clean card with subtle shadow.
**Material:** M3 FAB-style control buttons. Pin uses M3 icon style. Info window follows M3 card spec.
**Glassmorphism:** frosted glass control buttons overlaid on the map. Info window is a glass card. Pin has a glass head.
**Liquid Glass:** refractive control buttons. Info window uses liquid glass material. Premium Apple Maps feel.
**Neumorphism:** control buttons raised from a soft panel overlaid on the map. Info window flush with the same soft surface.
**Skeuomorphism:** controls look like physical compass/toolbar buttons. Pin is a realistic red pin with shadow. Info window looks like a paper card.
**Neo-Brutalism:** thick-bordered control buttons. Pin is a bold square. Info window has hard offset shadow.
**Claymorphism:** puffy round control buttons. Pin is a soft clay sphere. Playful.
**Aurora/Gradient:** control buttons have gradient borders. Pin head glows. Info window has gradient accent.
**Minimal/Swiss:** thin-bordered controls. Pin is a minimal dot. Info window is pure typography, no decoration.
**UJG Brand:** Night-tinted control buttons with Eminence accents. Pin is Goldenrod. Info window on Night surface with Eminence border.

Full style definitions on the 🎨 Design Styles (visual languages) ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).