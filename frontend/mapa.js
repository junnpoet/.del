const GOOGLE_MAPS_API_KEY = window.GOOGLE_MAPS_API_KEY || '';

        // Centro por defecto (Chimbote) si no se puede obtener tu ubicación
        const DEFAULT_CENTER = { lat: -9.0853, lng: -78.5783 };

        function colorToken(name) {
            const channels = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
            return `rgb(${channels.split(/\s+/).join(', ')})`;
        }

        // Radio de la zona aproximada cuando no se encuentra un límite real (metros)
        const APPROX_RADIUS = 400;

        const ZONE_SOURCES = {
            custom: 'Delimitado por ti',
            osm: 'Límite según OpenStreetMap',
            approx: 'Zona aproximada · usa ✎ para ajustarla'
        };

        const TYPES = {
            recurso:      { label: 'Recurso',      border: 'border-l-ayniOrange-600', badge: 'bg-ayniOrange-600', tile: 'bg-ayniOrange-50 text-ayniOrange-600', text: 'text-ayniOrange-600', color: colorToken('--color-ayni-orange-600') },
            voluntariado: { label: 'Voluntariado', border: 'border-l-brand-600',      badge: 'bg-brand-600',      tile: 'bg-brand-50 text-brand-600',           text: 'text-brand-600',      color: colorToken('--color-brand-600') },
            seguro:       { label: 'Zona segura',  border: 'border-l-emerald-600',    badge: 'bg-emerald-600',    tile: 'bg-emerald-50 text-emerald-600',       text: 'text-emerald-600',    color: colorToken('--color-emerald-600') },
            riesgo:       { label: 'Riesgo',       border: 'border-l-red-600',        badge: 'bg-red-600',        tile: 'bg-red-50 text-red-600',               text: 'text-red-600',        color: colorToken('--color-red-600') }
        };

        const DEFAULT_ICONS = { recurso: 'fa-toolbox', voluntariado: 'fa-bowl-food', seguro: 'fa-shield-heart', riesgo: 'fa-triangle-exclamation' };
        const DEFAULT_PIN_GLYPHS = {
            recurso: '\uf3cd',
            voluntariado: '\uf590',
            seguro: '\uf015',
            riesgo: '\uf095'
        };

        // Puntos de ejemplo: dx / dy son metros al este / norte del centro de tu barrio.
        // Se colocan dentro de los límites de tu barrio.
        let items = [
            { id: 1, type: 'recurso',      icon: 'fa-kit-medical',  markerGlyph: '\uf3cd', title: 'Botiquín de primeros auxilios', owner: 'Sra. Rosa',          zone: 'Mz F Lt 2',                dx: -120, dy: 100,  phone: '51987654331', note: 'Disponible a cualquier hora.' },
            { id: 2, type: 'recurso',      icon: 'fa-bolt',         markerGlyph: '\uf095', title: 'Generador eléctrico 5 KW',      owner: 'Don Pedro',          zone: 'Mz C Lt 4',                dx: 180,  dy: 160,  phone: '51987654332', note: 'Se presta con combustible propio.' },
            { id: 3, type: 'voluntariado', icon: 'fa-bowl-food',    markerGlyph: '\uf4ad', title: 'Olla común Mz B',               owner: 'Comité de mujeres',  zone: 'Local comunal',            dx: 300,  dy: -60,  phone: '51987654333', note: 'Falta arroz y aceite. Se aceptan donaciones.' },
            { id: 4, type: 'seguro',       icon: 'fa-tree',         markerGlyph: '\uf015', title: 'Parque principal',              owner: 'Punto de reunión',   zone: 'Zona abierta',             dx: -250, dy: 200,  phone: '',            note: 'Espacio abierto. Punto de reunión ante sismos.' },
            { id: 5, type: 'recurso',      icon: 'fa-truck-pickup', markerGlyph: '\uf095', title: 'Camioneta de carga',            owner: 'Carlos M.',          zone: 'Mz K Lt 10',               dx: -200, dy: -250, phone: '51987654334', note: 'Para traslado de personas o víveres.' },
            { id: 6, type: 'seguro',       icon: 'fa-school',       markerGlyph: '\uf015', title: 'Colegio del barrio',            owner: 'Punto de reunión',   zone: 'Patio amplio',             dx: 60,   dy: -420, phone: '',            note: 'Patio amplio. Zona alta y segura.' },
            { id: 7, type: 'recurso',      icon: 'fa-faucet-drip',  markerGlyph: '\uf0e0', title: 'Tanque de agua 1000 L',         owner: 'Comité vecinal',     zone: 'Local comunal',            dx: 380,  dy: -300, phone: '51987654335', note: 'Se reparte en bidones.' },
            { id: 8, type: 'riesgo',       icon: 'fa-water',        markerGlyph: '\uf590', title: 'Quebrada o cauce cercano',      owner: 'Riesgo de huaico',   zone: 'Evitar en lluvias',        dx: 520,  dy: 380,  phone: '',            note: 'Evitar la zona en época de lluvias.' }
        ];

        let selectedCategory = 'all';
        let nextId = 9;

        // Estado del mapa y la ubicación
        let map = null;
        let mapReady = false;
        let userPos = null;          // posición real del usuario {lat, lng, acc}
        let anchor = null;           // primera ubicación obtenida
        let anchorIsDefault = false;
        let userMarker = null;
        let accuracyCircle = null;
        let markers = [];
        let watchId = null;
        let lastRenderPos = null;

        // Estado de la zona (barrio)
        let zone = null;             // { name, source, path:[{lat,lng}], center, bounds }
        let zonePoly = null;
        let zoneLine = null;
        let zoneRequestId = 0;

        // Estado del dibujo manual
        let drawing = false;
        let drawPts = [];
        let drawLine = null;
        let drawMarkers = [];
        let drawListener = null;

        // ---------- Utilidades geográficas ----------
        function offsetLatLng(base, dxMeters, dyMeters) {
            const lat = base.lat + dyMeters / 111320;
            const lng = base.lng + dxMeters / (111320 * Math.cos(base.lat * Math.PI / 180));
            return { lat, lng };
        }

        function distanceMeters(a, b) {
            const R = 6371000;
            const toRad = d => d * Math.PI / 180;
            const dLat = toRad(b.lat - a.lat);
            const dLng = toRad(b.lng - a.lng);
            const h = Math.sin(dLat / 2) ** 2 +
                      Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
            return 2 * R * Math.asin(Math.sqrt(h));
        }

        function formatDistance(d) {
            return d < 1000 ? Math.round(d) + ' m' : (d / 1000).toFixed(1) + ' km';
        }

        // ¿El punto está dentro del polígono? (ray casting)
        function pointInPoly(p, path) {
            let inside = false;
            for (let i = 0, j = path.length - 1; i < path.length; j = i++) {
                const xi = path[i].lng, yi = path[i].lat;
                const xj = path[j].lng, yj = path[j].lat;
                const intersect = ((yi > p.lat) !== (yj > p.lat)) &&
                    (p.lng < (xj - xi) * (p.lat - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }
            return inside;
        }

        function boundsOf(path) {
            let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
            path.forEach(p => {
                minLat = Math.min(minLat, p.lat); maxLat = Math.max(maxLat, p.lat);
                minLng = Math.min(minLng, p.lng); maxLng = Math.max(maxLng, p.lng);
            });
            return { minLat, maxLat, minLng, maxLng };
        }

        function polygonCenter(path) {
            const b = boundsOf(path);
            // promedio de vértices y centro de la caja; se usa el que quede dentro del polígono
            const avg = {
                lat: path.reduce((s, p) => s + p.lat, 0) / path.length,
                lng: path.reduce((s, p) => s + p.lng, 0) / path.length
            };
            const box = { lat: (b.minLat + b.maxLat) / 2, lng: (b.minLng + b.maxLng) / 2 };
            if (pointInPoly(avg, path)) return avg;
            if (pointInPoly(box, path)) return box;
            return avg;
        }

        function buildZone(path, name, source) {
            return { name: name, source: source, path: path, center: polygonCenter(path), bounds: boundsOf(path) };
        }

        function approxZone(pos, name) {
            const path = [];
            for (let k = 0; k < 40; k++) {
                const ang = (k / 40) * 2 * Math.PI;
                path.push(offsetLatLng(pos, Math.cos(ang) * APPROX_RADIUS, Math.sin(ang) * APPROX_RADIUS));
            }
            const z = buildZone(path, name || 'Mi zona', 'approx');
            z.center = { lat: pos.lat, lng: pos.lng };
            return z;
        }

        function referencePos() {
            return userPos || (zone && zone.center) || anchor || DEFAULT_CENTER;
        }

        // Los puntos de ejemplo se acercan al centro hasta quedar dentro del barrio
        function demoPosition(i) {
            if (!zone) return offsetLatLng(anchor || DEFAULT_CENTER, i.dx, i.dy);
            let s = 1;
            for (let k = 0; k < 14; k++) {
                const p = offsetLatLng(zone.center, i.dx * s, i.dy * s);
                if (pointInPoly(p, zone.path)) return p;
                s *= 0.8;
            }
            return zone.center;
        }

        function itemsWithGeo() {
            const ref = referencePos();
            return items.map(i => {
                const pos = (i.lat !== undefined) ? { lat: i.lat, lng: i.lng } : demoPosition(i);
                return { ...i, pos, distance: distanceMeters(ref, pos) };
            });
        }

        function getFiltered() {
            const q = document.getElementById('searchInput').value.toLowerCase();
            return itemsWithGeo().filter(i => {
                const matchCat = selectedCategory === 'all' || i.type === selectedCategory;
                const matchSearch = i.title.toLowerCase().includes(q) ||
                                    i.owner.toLowerCase().includes(q) ||
                                    TYPES[i.type].label.toLowerCase().includes(q);
                return matchCat && matchSearch;
            }).sort((a, b) => a.distance - b.distance);
        }

        // ---------- Google Maps ----------
        function showMapMessage(title, text) {
            document.getElementById('mapMessageTitle').textContent = title;
            document.getElementById('mapMessageText').textContent = text;
            document.getElementById('mapMessage').classList.remove('hidden');
        }

        function loadGoogleMaps() {
            if (!GOOGLE_MAPS_API_KEY) {
                showMapMessage('Falta la clave de Google Maps',
                    'Configura una clave restringida en google-maps-config.js para cargar el mapa.');
                return;
            }
            if (!navigator.onLine) {
                showMapMessage('Sin conexión', 'El mapa necesita internet. Cuando vuelva la señal se cargará solo.');
                window.addEventListener('online', () => location.reload(), { once: true });
                return;
            }
            const s = document.createElement('script');
            s.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(GOOGLE_MAPS_API_KEY) + '&callback=initMap&v=weekly';
            s.async = true;
            s.defer = true;
            s.onerror = () => showMapMessage('No se pudo cargar Google Maps', 'Revisa tu conexión a internet.');
            document.head.appendChild(s);
        }

        // Google llama a esta función si la clave no es válida
        window.gm_authFailure = function () {
            showMapMessage('La clave de Google Maps no funciona',
                'Revisa que sea correcta, que Maps JavaScript API esté habilitada y que la facturación esté activa.');
        };

        window.initMap = function () {
            map = new google.maps.Map(document.getElementById('map'), {
                center: referencePos(),
                zoom: 16,
                disableDefaultUI: true,
                zoomControl: true,
                zoomControlOptions: { position: google.maps.ControlPosition.LEFT_CENTER },
                clickableIcons: false,
                gestureHandling: 'greedy'
            });
            mapReady = true;
            drawUser();
            drawZone();
            renderPins(true);
            refineApproxName();
        };

        function drawUser() {
            if (!mapReady || !userPos) return;
            if (!userMarker) {
                userMarker = new google.maps.Marker({
                    position: userPos,
                    map: map,
                    title: 'Tú estás aquí',
                    zIndex: 999,
                    clickable: false,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: colorToken('--color-blue-600'),
                        fillOpacity: 1,
                        strokeColor: colorToken('--color-white'),
                        strokeWeight: 3
                    }
                });
                accuracyCircle = new google.maps.Circle({
                    map: map,
                    center: userPos,
                    radius: userPos.acc || 30,
                    strokeColor: colorToken('--color-blue-600'),
                    strokeOpacity: 0.3,
                    strokeWeight: 1,
                    fillColor: colorToken('--color-blue-600'),
                    fillOpacity: 0.1,
                    clickable: false
                });
            } else {
                userMarker.setPosition(userPos);
                accuracyCircle.setCenter(userPos);
                accuracyCircle.setRadius(userPos.acc || 30);
            }
        }

        // Límite del barrio: línea roja punteada y relleno suave
        function drawZone() {
            if (zonePoly) { zonePoly.setMap(null); zonePoly = null; }
            if (zoneLine) { zoneLine.setMap(null); zoneLine = null; }
            if (!mapReady || !zone) return;

            zonePoly = new google.maps.Polygon({
                paths: zone.path,
                map: map,
                strokeWeight: 0,
                fillColor: colorToken('--color-red-600'),
                fillOpacity: 0.07,
                clickable: false,
                zIndex: 1
            });

            zoneLine = new google.maps.Polyline({
                path: zone.path.concat([zone.path[0]]),
                map: map,
                strokeOpacity: 0,
                clickable: false,
                zIndex: 2,
                icons: [{
                    icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, strokeColor: colorToken('--color-red-600'), strokeWeight: 3, scale: 3 },
                    offset: '0',
                    repeat: '14px'
                }]
            });
        }

        function renderPins(fit) {
            if (!mapReady) return;
            markers.forEach(m => m.setMap(null));
            markers = [];

            const list = getFiltered();
            const bounds = new google.maps.LatLngBounds();
            if (userPos) bounds.extend(userPos);
            if (zone) zone.path.forEach(p => bounds.extend(p));

            list.forEach(i => {
                const t = TYPES[i.type];
                const marker = new google.maps.Marker({
                    position: i.pos,
                    map: map,
                    title: i.title,
                    clickable: !drawing,
                    icon: {
                        url: createPinIcon(t.color),
                        scaledSize: new google.maps.Size(28, 34),
                        anchor: new google.maps.Point(14, 33),
                        labelOrigin: new google.maps.Point(14, 12)
                    },
                    label: {
                        text: i.markerGlyph || DEFAULT_PIN_GLYPHS[i.type],
                        color: colorToken('--color-white'),
                        fontFamily: '"Font Awesome 6 Free"',
                        fontSize: '10px',
                        fontWeight: '900'
                    }
                });
                marker.addListener('click', () => openPinCard(i.id));
                markers.push(marker);
                bounds.extend(i.pos);
            });

            if (fit && !bounds.isEmpty()) {
                map.fitBounds(bounds, 40);
                google.maps.event.addListenerOnce(map, 'idle', () => {
                    if (map.getZoom() > 18) map.setZoom(18);
                });
            }
        }

        function createPinIcon(color) {
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="34" viewBox="0 0 40 48"><path d="M20 1C9.5 1 1 9.5 1 20c0 12 19 27 19 27s19-15 19-27C39 9.5 30.5 1 20 1Z" fill="${color}" stroke="${colorToken('--color-white')}" stroke-width="2"/></svg>`;
            return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
        }

        // Nombre del barrio según Google (si el Geocoder está habilitado)
        function geocodeName(pos) {
            return new Promise(resolve => {
                if (!(window.google && google.maps && google.maps.Geocoder)) return resolve(null);
                try {
                    new google.maps.Geocoder().geocode({ location: pos }, (results, status) => {
                        if (status !== 'OK' || !results || !results[0]) return resolve(null);
                        const comps = results[0].address_components;
                        const get = type => { const c = comps.find(x => x.types.includes(type)); return c ? c.long_name : null; };
                        const name = get('neighborhood') || get('sublocality_level_1') || get('sublocality') || get('locality');
                        resolve(name || null);
                    });
                } catch (e) { resolve(null); }
            });
        }

        function refineApproxName() {
            if (!zone || zone.source !== 'approx' || zone.named) return;
            const current = zone;
            geocodeName(current.center).then(name => {
                if (name && zone === current) {
                    zone.name = name;
                    zone.named = true;
                    showZoneLabels();
                }
            });
        }

        // ---------- Zona (barrio) ----------
        function showZoneLabels() {
            if (!zone) return;
            document.getElementById('currentZoneText').textContent = zone.name;
            document.getElementById('zoneChipName').textContent = zone.name;
            document.getElementById('zoneChipSrc').textContent = ZONE_SOURCES[zone.source];
            document.getElementById('zoneChip').classList.remove('hidden');
        }

        function applyZone(z, fit) {
            zone = z;
            showZoneLabels();
            drawZone();
            renderList();
            renderPins(!!fit);
        }

        function loadSavedZone() {
            try {
                const raw = localStorage.getItem('ayni_zone');
                if (!raw) return null;
                const z = JSON.parse(raw);
                if (!z || !Array.isArray(z.path) || z.path.length < 3) return null;
                return buildZone(z.path, z.name || 'Mi barrio', 'custom');
            } catch (e) { return null; }
        }

        function saveZone(z) {
            try { localStorage.setItem('ayni_zone', JSON.stringify({ name: z.name, path: z.path })); } catch (e) { /* almacenamiento no disponible */ }
        }

        function clearSavedZone() {
            try { localStorage.removeItem('ayni_zone'); } catch (e) { /* almacenamiento no disponible */ }
        }

        // Busca en OpenStreetMap el polígono del barrio donde estás
        async function fetchOsmZone(pos) {
            for (const level of [16, 15, 14]) {
                const ctrl = new AbortController();
                const timer = setTimeout(() => ctrl.abort(), 7000);
                try {
                    const url = 'https://nominatim.openstreetmap.org/reverse?format=jsonv2&polygon_geojson=1&accept-language=es' +
                                '&zoom=' + level + '&lat=' + pos.lat + '&lon=' + pos.lng;
                    const res = await fetch(url, { signal: ctrl.signal });
                    if (!res.ok) continue;
                    const data = await res.json();
                    const g = data && data.geojson;
                    if (!g || (g.type !== 'Polygon' && g.type !== 'MultiPolygon')) continue;

                    const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
                    let ring = null;
                    for (const poly of polys) {
                        const candidate = poly[0].map(c => ({ lat: c[1], lng: c[0] }));
                        if (pointInPoly(pos, candidate)) { ring = candidate; break; }
                    }
                    if (!ring) continue;

                    // Descarta límites demasiado grandes (distrito o ciudad) o diminutos
                    const b = boundsOf(ring);
                    const diag = distanceMeters({ lat: b.minLat, lng: b.minLng }, { lat: b.maxLat, lng: b.maxLng });
                    if (diag > 3500 || diag < 80) continue;

                    const a = data.address || {};
                    const name = data.name || a.neighbourhood || a.suburb || a.quarter || a.city_district || 'Mi barrio';
                    return buildZone(ring, name, 'osm');
                } catch (e) {
                    /* sin conexión o tiempo agotado: se prueba el siguiente nivel */
                } finally {
                    clearTimeout(timer);
                }
            }
            return null;
        }

        // Decide qué barrio mostrar: guardado por ti → OpenStreetMap → zona aproximada
        async function setupZone(pos, force) {
            const myRequest = ++zoneRequestId;

            if (!force) {
                const saved = loadSavedZone();
                if (saved && (pointInPoly(pos, saved.path) || distanceMeters(pos, saved.center) < 1500)) {
                    applyZone(saved, true);
                    return;
                }
            }

            showToast('Buscando los límites de tu barrio...');
            let z = null;
            if (navigator.onLine) z = await fetchOsmZone(pos);
            if (myRequest !== zoneRequestId) return;   // llegó una solicitud más reciente

            if (z) {
                applyZone(z, true);
                showToast('Barrio detectado: ' + z.name);
            } else {
                applyZone(approxZone(pos, 'Mi zona'), true);
                refineApproxName();
                showToast('No hay límites exactos de tu barrio. Mostramos una zona aproximada.');
            }
        }

        function redetectZone() {
            closeZoneModal();
            clearSavedZone();
            if (userPos) setupZone(userPos, true);
            else locate(true);
        }

        // ---------- Dibujar los límites del barrio ----------
        function startDrawing() {
            if (!mapReady) {
                showToast('El mapa aún no está listo.');
                return;
            }
            drawing = true;
            drawPts = [];
            document.getElementById('mapFloatingCard').classList.add('hidden');
            document.getElementById('drawBar').classList.remove('hidden');
            document.getElementById('mainView').scrollTo({ top: 0, behavior: 'smooth' });
            updateDrawHint();
            renderPins(false);   // los pines no se pueden tocar mientras dibujas
            drawListener = map.addListener('click', e => {
                drawPts.push({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                updateDrawPreview();
            });
        }

        function updateDrawHint() {
            document.getElementById('drawHint').textContent = drawPts.length < 3
                ? 'Toca el mapa en cada esquina del límite de tu barrio (mínimo 3 puntos). Puntos: ' + drawPts.length
                : 'Puntos: ' + drawPts.length + '. Toca "Listo" cuando termines.';
        }

        function updateDrawPreview() {
            if (drawLine) drawLine.setMap(null);
            drawMarkers.forEach(m => m.setMap(null));

            drawMarkers = drawPts.map(p => new google.maps.Marker({
                position: p,
                map: map,
                clickable: false,
                icon: { path: google.maps.SymbolPath.CIRCLE, scale: 5, fillColor: colorToken('--color-red-600'), fillOpacity: 1, strokeColor: colorToken('--color-white'), strokeWeight: 2 }
            }));

            drawLine = new google.maps.Polyline({
                path: drawPts.length > 2 ? drawPts.concat([drawPts[0]]) : drawPts,
                map: map,
                strokeColor: colorToken('--color-red-600'),
                strokeWeight: 3,
                clickable: false
            });
            updateDrawHint();
        }

        function undoDraw() {
            if (!drawing || drawPts.length === 0) return;
            drawPts.pop();
            updateDrawPreview();
        }

        function endDrawing() {
            drawing = false;
            drawPts = [];
            if (drawListener) { google.maps.event.removeListener(drawListener); drawListener = null; }
            if (drawLine) { drawLine.setMap(null); drawLine = null; }
            drawMarkers.forEach(m => m.setMap(null));
            drawMarkers = [];
            document.getElementById('drawBar').classList.add('hidden');
        }

        function cancelDraw() {
            endDrawing();
            renderPins(false);
        }

        function finishDraw() {
            if (drawPts.length < 3) {
                showToast('Marca al menos 3 puntos para cerrar el barrio.');
                return;
            }
            const suggested = (zone && zone.name && zone.source !== 'approx') ? zone.name : '';
            const name = (window.prompt('¿Cómo se llama tu barrio?', suggested) || '').trim() || 'Mi barrio';
            const z = buildZone(drawPts.slice(), name, 'custom');
            endDrawing();
            saveZone(z);
            zoneRequestId++;
            applyZone(z, true);
            showToast('Límites de tu barrio guardados.');
        }

        // ---------- Ubicación del usuario ----------
        function locate(recenter) {
            if (!navigator.geolocation) {
                onLocationError();
                return;
            }
            showToast('Buscando tu ubicación...');
            navigator.geolocation.getCurrentPosition(
                pos => { onPosition(pos, recenter); startWatching(); },
                err => onLocationError(err),
                { enableHighAccuracy: true, timeout: 12000, maximumAge: 15000 }
            );
        }

        function startWatching() {
            if (watchId !== null || !navigator.geolocation) return;
            watchId = navigator.geolocation.watchPosition(
                pos => onPosition(pos, false),
                () => {},
                { enableHighAccuracy: true, maximumAge: 10000 }
            );
        }

        function onPosition(pos, recenter) {
            userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy };

            const firstRealFix = !anchor || anchorIsDefault;
            if (firstRealFix) {
                anchor = { lat: userPos.lat, lng: userPos.lng };
                anchorIsDefault = false;
                setupZone(anchor, false);
            }

            drawUser();

            const moved = !lastRenderPos || distanceMeters(lastRenderPos, userPos) > 20;
            if (firstRealFix || recenter || moved) {
                lastRenderPos = { lat: userPos.lat, lng: userPos.lng };
                renderList();
                renderPins(firstRealFix);
            }

            if (recenter && mapReady && !firstRealFix) {
                map.panTo(userPos);
                map.setZoom(17);
            }
        }

        function onLocationError() {
            if (!anchor) {
                anchor = { ...DEFAULT_CENTER };
                anchorIsDefault = true;
                applyZone(approxZone(DEFAULT_CENTER, 'Chimbote (ubicación no disponible)'), true);
            }
            showToast('No pudimos obtener tu ubicación. Activa el GPS y da permiso al navegador.');
        }

        // ---------- Render ----------
        function renderAll(fit) {
            renderList();
            renderPins(!!fit);
        }

        function renderList() {
            const filtered = getFiltered();
            document.getElementById('resultsCount').textContent =
                filtered.length + (filtered.length === 1 ? ' punto encontrado' : ' puntos encontrados');

            const container = document.getElementById('listView');
            if (filtered.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300 p-4">
                        <i class="fa-solid fa-map-location-dot text-3xl text-slate-300 mb-2"></i>
                        <p class="text-xs font-bold text-slate-600">No se encontraron puntos</p>
                        <p class="text-[10px] text-slate-400">Prueba con otro filtro o búsqueda.</p>
                    </div>`;
                return;
            }

            container.innerHTML = filtered.map(i => {
                const t = TYPES[i.type];
                const dest = i.pos.lat + ',' + i.pos.lng;
                const contactBtn = i.phone
                    ? `<a href="https://wa.me/${i.phone}" target="_blank" class="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                           <i class="fa-brands fa-whatsapp text-xs"></i><span>WhatsApp</span>
                       </a>`
                    : `<a href="https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=walking" target="_blank" class="bg-slate-900 hover:bg-slate-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                           <i class="fa-solid fa-route text-xs"></i><span>Cómo llegar</span>
                       </a>`;

                return `
                <div class="bg-white rounded-xl border border-slate-200 border-l-4 ${t.border} overflow-hidden shadow-lg shadow-slate-400/30 hover:shadow-xl hover:shadow-slate-500/30 transition-shadow">
                    <div class="p-3 flex gap-3 items-start">
                        <div class="relative shrink-0">
                            <div class="w-20 h-20 rounded-lg ${t.tile} border border-slate-200 flex items-center justify-center text-3xl">
                                <i class="fa-solid ${i.icon}"></i>
                            </div>
                            <span class="absolute -bottom-1 -right-1 ${t.badge} text-white text-[9px] font-bold px-1.5 rounded-md shadow">${t.label}</span>
                        </div>

                        <div class="flex-1 min-w-0">
                            <h3 class="text-xs font-bold text-slate-800 leading-tight">${i.title}</h3>
                            <p class="text-[10px] text-slate-600 font-medium flex items-start gap-1 mt-1">
                                <i class="fa-solid fa-location-arrow ${t.text}"></i>
                                <span class="min-w-0 break-words"><span class="font-semibold text-slate-700">${i.owner}:</span> ${i.zone}</span>
                            </p>
                            <p class="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                <i class="fa-solid fa-person-walking text-slate-400"></i>
                                <span>A ${formatDistance(i.distance)} de ti</span>
                            </p>
                            <p class="text-[10px] text-slate-500 leading-snug mt-1">${i.note}</p>

                            <div class="mt-1.5 flex items-center justify-end space-x-1.5">
                                ${contactBtn}
                                <button onclick="focusOnMap(${i.id})" aria-label="Ver en el mapa" title="Ver en el mapa" class="w-6 h-6 rounded-full bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center">
                                    <i class="fa-solid fa-map-pin text-xs"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`;
            }).join('');
        }

        function openPinCard(id) {
            if (drawing) return;
            const i = itemsWithGeo().find(x => x.id === id);
            if (!i) return;
            const t = TYPES[i.type];
            const dest = i.pos.lat + ',' + i.pos.lng;
            const card = document.getElementById('mapFloatingCard');
            card.innerHTML = `
                <div class="flex items-center gap-2">
                    <div class="w-12 h-12 rounded-xl ${t.tile} flex items-center justify-center text-xl shrink-0">
                        <i class="fa-solid ${i.icon}"></i>
                    </div>
                    <div class="flex-1 min-w-0 text-xs">
                        <h4 class="font-bold text-slate-800 truncate">${i.title}</h4>
                        <p class="text-[10px] text-slate-600 mt-0.5">${t.label} · ${i.owner}</p>
                        <p class="text-[10px] text-slate-500 mt-0.5">A ${formatDistance(i.distance)} de ti</p>
                    </div>
                    ${i.phone
                        ? `<a href="https://wa.me/${i.phone}" target="_blank" class="bg-emerald-600 text-white p-2 rounded-xl text-xs" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp text-sm"></i></a>`
                        : `<a href="https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=walking" target="_blank" class="bg-slate-900 text-white p-2 rounded-xl text-xs" aria-label="Cómo llegar"><i class="fa-solid fa-route text-sm"></i></a>`}
                    <button onclick="document.getElementById('mapFloatingCard').classList.add('hidden')" class="text-slate-400 hover:text-slate-600 p-1" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
                </div>`;
            card.classList.remove('hidden');
        }

        function focusOnMap(id) {
            document.getElementById('mainView').scrollTo({ top: 0, behavior: 'smooth' });
            const i = itemsWithGeo().find(x => x.id === id);
            if (mapReady && i) {
                map.panTo(i.pos);
                map.setZoom(17);
            }
            openPinCard(id);
        }

        function setCategory(cat) {
            selectedCategory = cat;
            document.querySelectorAll('.map-chip').forEach(btn => {
                const active = btn.dataset.cat === cat;
                btn.className = 'map-chip shrink-0 px-3 py-1.5 rounded-full font-semibold ' +
                    (active ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50');
            });
            document.getElementById('mapFloatingCard').classList.add('hidden');
            renderAll(true);
        }

        function clearSearch() {
            document.getElementById('searchInput').value = '';
            renderAll(false);
        }

        // ---------- Marcar en el mapa ----------
        function openAddModal() { document.getElementById('addModal').classList.remove('hidden'); }
        function closeAddModal() { document.getElementById('addModal').classList.add('hidden'); }

        function saveNewItem(e) {
            e.preventDefault();
            const type = document.getElementById('newType').value;
            const title = document.getElementById('newTitle').value.trim();
            if (!title) return;

            if (!userPos) {
                showToast('Necesitamos tu ubicación para marcar el punto. Toca el botón de ubicación.');
                return;
            }

            items.push({
                id: nextId++,
                type: type,
                icon: DEFAULT_ICONS[type],
                markerGlyph: DEFAULT_PIN_GLYPHS[type],
                title: title,
                owner: 'Tú',
                zone: 'Marcado en tu ubicación',
                lat: userPos.lat,
                lng: userPos.lng,
                phone: '',
                note: type === 'riesgo' ? 'Pendiente de validación por el administrador vecinal.' : 'Marcado por ti.'
            });

            document.getElementById('newTitle').value = '';
            closeAddModal();
            renderAll(false);
            showToast('Punto marcado en tu barrio.');
        }

        // ---------- Modo emergencia ----------
        function toggleEmergencyMode(enable) {
            const mobileFrame = document.getElementById('mobileFrame');

            document.getElementById('emergencyBanner').classList.toggle('hidden', !enable);
            mobileFrame.classList.toggle('emergency-mode', enable);

            setCategory(enable ? 'seguro' : 'all');
            document.getElementById('mainView').scrollTo({ top: 0 });
            showToast(enable ? 'Modo emergencia activado.' : 'Volviste al modo normal.');
        }

        function sendEmergencyStatus(status) {
            showToast('Estado enviado: "' + status + '".');
        }

        // ---------- Accesibilidad, zona, menú, toast ----------
        function toggleAccessibility() {
            const enabled = document.getElementById('mobileFrame').classList.toggle('large-text');
            const btn = document.getElementById('accessibilityBtn');
            btn.setAttribute('aria-pressed', String(enabled));
            btn.setAttribute('aria-label', enabled ? 'Desactivar texto grande' : 'Activar texto grande');
            showToast(enabled ? 'Texto grande activado.' : 'Texto grande desactivado.');
        }

        function openZoneModal() {
            document.getElementById('zoneModalName').textContent = zone ? zone.name : 'Buscando tu barrio...';
            document.getElementById('zoneModal').classList.remove('hidden');
        }
        function closeZoneModal() { document.getElementById('zoneModal').classList.add('hidden'); }

        function toggleMenu() {
            const menu = document.getElementById('appMenu');
            const isOpening = menu.classList.contains('hidden');
            menu.classList.toggle('hidden', !isOpening);
            document.getElementById('appMenuTrigger').setAttribute('aria-expanded', String(isOpening));
        }
        function closeMenu() {
            document.getElementById('appMenu').classList.add('hidden');
            document.getElementById('appMenuTrigger').setAttribute('aria-expanded', 'false');
        }
        function selectMenuOption(option) {
            const messages = {
                perfil: 'Perfil: próximamente.',
                configuracion: 'Configuración: próximamente.',
                'banco-tiempo': 'Banco de Tiempo Ayni: próximamente.'
            };
            closeMenu();
            if (option === 'perfil') {
                openProfileModal();
                return;
            }
            showToast(messages[option]);
        }
        function openProfileModal() {
            document.getElementById('profileZoneText').textContent = document.getElementById('currentZoneText').textContent.trim();
            document.getElementById('profileModal').classList.remove('hidden');
        }
        function closeProfileModal() {
            document.getElementById('profileModal').classList.add('hidden');
        }

        let toastTimer;
        function showToast(msg) {
            document.getElementById('toastMsg').textContent = msg;
            const toast = document.getElementById('toast');
            toast.classList.remove('hidden');
            clearTimeout(toastTimer);
            toastTimer = setTimeout(hideToast, 3500);
        }
        function hideToast() {
            document.getElementById('toast').classList.add('hidden');
        }

        // ---------- Inicio ----------
        document.addEventListener('DOMContentLoaded', () => {
            renderList();
            loadGoogleMaps();
            locate(false);
        });
