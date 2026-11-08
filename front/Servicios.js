// Mock dataset reflecting Peruvian local neighborhood trades & structure
        let servicesData = [
            {
                id: 1,
                title: "Don Lucho - Gasfitería & Presión de Agua",
                category: "Gasfitero",
                distance: 250, // in meters
                zone: "Mz D Lt 14 - Barrio La Unión",
                rating: 4.9,
                reviewsCount: 24,
                phone: "51987654321",
                photo: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80",
                description: "Especialista en fugas, tanques elevados, bombas de agua y desatoro de tuberías las 24 horas.",
                transport: "Mototaxi cercano: Paradero 3 (a 50 metros)",
                lat: 120,
                lng: 160
            },
            {
                id: 2,
                title: "Doña Elena - Confecciones y Arreglos",
                category: "Costurera",
                distance: 400,
                zone: "Av. Las Flores Mz F Lt 5",
                rating: 4.8,
                reviewsCount: 19,
                phone: "51987654322",
                photo: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=400&q=80",
                description: "Arreglo de cierres, remalle, dobladillo de pantalones y confección de uniformes escolares.",
                transport: "Colectivo Ruta A1 deja en la misma esquina",
                lat: 90,
                lng: 260
            },
            {
                id: 3,
                title: "Técnico Juan - Reparaciones Eléctricas",
                category: "Electricista",
                distance: 750,
                zone: "Calle Los Pinos 340",
                rating: 4.7,
                reviewsCount: 15,
                phone: "51987654323",
                photo: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80",
                description: "Instalación de tableros eléctricos, llaves térmicas, cortocircuitos y luces LED.",
                transport: "Mototaxi directo desde la entrada del barrio",
                lat: 250,
                lng: 90
            },
            {
                id: 4,
                title: "Bodega Don José - Abarrotes y Gas",
                category: "Bodega",
                distance: 180,
                zone: "Esquina Mz A Lt 1",
                rating: 5.0,
                reviewsCount: 42,
                phone: "51987654324",
                photo: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=400&q=80",
                description: "Venta de abarrotes de primera necesidad, verduras frescas y balones de gas a domicilio.",
                transport: "A 2 minutos caminando",
                lat: 180,
                lng: 200
            },
            {
                id: 5,
                title: "Asociación Mototaxis 'Los Rápidos'",
                category: "Mototaxista",
                distance: 300,
                zone: "Paradero Principal Bellamar",
                rating: 4.9,
                reviewsCount: 31,
                phone: "51987654325",
                photo: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=400&q=80",
                description: "Servicio de transporte formal, encomiendas y traslados directos dentro del distrito.",
                transport: "Paradero fijo las 24 horas",
                lat: 300,
                lng: 220
            }
        ];

        let selectedCategory = 'all';
        // Initialize App UI
        document.addEventListener('DOMContentLoaded', () => {
            renderServicesList();
            renderMapPins();
        });

        // RENDER SERVICES IN LIST VIEW
        function renderServicesList() {
            const container = document.getElementById('listView');
            const filtered = getFilteredData();
            const resultsCount = document.getElementById('resultsCount');
            resultsCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'servicio encontrado' : 'servicios encontrados'}`;

            if (filtered.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300 p-4">
                        <i class="fa-solid fa-store-slash text-3xl text-slate-300 mb-2"></i>
                        <p class="text-xs font-bold text-slate-600">No se encontraron servicios</p>
                        <p class="text-[10px] text-slate-400">Intenta cambiando los filtros o la búsqueda.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = filtered.map(item => `
                <!-- WIREFRAME REPLICATION: ORANGE BORDER CARD WITH ACCORDION DETAILED TOGGLE -->
                <div class="bg-white rounded-xl border border-slate-200 border-l-4 border-l-ayniOrange-600 overflow-hidden shadow-lg shadow-slate-400/30 hover:shadow-xl hover:shadow-slate-500/30 transition-shadow">
                    <div class="p-3 flex gap-3 items-start">
                        <!-- Left Side: Photo -->
                        <div class="relative shrink-0">
                            <img src="${item.photo}" alt="${item.title}" class="w-20 h-20 rounded-lg object-cover border border-slate-200">
                            <span class="absolute -bottom-1 -right-1 bg-ayniOrange-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-md shadow">
                                ${item.category}
                            </span>
                        </div>

                        <!-- Right Side: Info -->
                        <div class="flex-1 min-w-0">
                            <h3 class="text-xs font-bold text-slate-800 leading-tight truncate">${item.title}</h3>
                            <p class="text-[10px] text-slate-600 font-medium flex items-start gap-1 mt-1">
                                <i class="fa-solid fa-location-arrow text-ayniOrange-600"></i>
                                <span class="min-w-0 break-words"><span class="font-semibold text-slate-700">Ubicación del vecino:</span> ${item.zone}</span>
                            </p>
                            <p class="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                <i class="fa-solid fa-person-walking text-slate-400"></i>
                                <span>A ${item.distance} m de ti</span>
                            </p>

                            <!-- Rating & Reviews -->
                            <div class="mt-1 flex items-center justify-between text-[10px]">
                                <span class="font-bold text-amber-600 flex items-center gap-0.5">
                                    <i class="fa-solid fa-star"></i> ${item.rating} (${item.reviewsCount})
                                </span>

                                <!-- Action Buttons: WhatsApp & Wireframe Expand Triangle Arrow -->
                                <div class="flex items-center space-x-1.5">
                                    <a href="https://wa.me/${item.phone}" target="_blank" onclick="event.stopPropagation()" class="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                        <i class="fa-brands fa-whatsapp text-xs"></i>
                                        <span>WhatsApp</span>
                                    </a>

                                    <!-- Expandable Accordion Arrow (Exact visual match to the green triangle in user sketch) -->
                                    <button onclick="toggleCardDetails(${item.id})" class="w-6 h-6 rounded-full bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center transition-transform" id="arrowBtn-${item.id}">
                                        <i class="fa-solid fa-circle-chevron-down text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- EXPANDABLE DETAILS ACCORDION SECTION -->
                    <div id="details-${item.id}" class="accordion-content bg-white border-t border-ayniOrange-200 px-3 py-2 space-y-2 text-[11px]">
                        <div>
                            <span class="font-bold text-slate-700">Detalles de atención:</span>
                            <p class="text-slate-600 text-[10px] leading-snug">${item.description}</p>
                        </div>
                        <div class="bg-slate-100 p-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5 text-[10px] text-slate-700">
                            <i class="fa-solid fa-bus text-ayniOrange-600"></i>
                            <span class="font-medium"><strong>Transporte cercano:</strong> ${item.transport}</span>
                        </div>
                        <div class="flex justify-between items-center text-[10px] pt-1">
                            <button onclick="speakText('${item.title}. ${item.description}')" class="text-brand-700 hover:underline flex items-center gap-1 font-semibold">
                                <i class="fa-solid fa-volume-high"></i> Escuchar Audio
                            </button>
                            <span class="text-slate-400">ID Verificado: #00${item.id}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // TOGGLE ACCORDION DETAILS ON CARD
        function toggleCardDetails(id) {
            const accordion = document.getElementById(`details-${id}`);
            const arrowBtn = document.getElementById(`arrowBtn-${id}`);
            
            if (accordion.classList.contains('open')) {
                accordion.classList.remove('open');
                arrowBtn.style.transform = 'rotate(0deg)';
            } else {
                // close others
                document.querySelectorAll('.accordion-content').forEach(el => el.classList.remove('open'));
                document.querySelectorAll('[id^="arrowBtn-"]').forEach(el => el.style.transform = 'rotate(0deg)');
                
                accordion.classList.add('open');
                arrowBtn.style.transform = 'rotate(180deg)';
            }
        }

        // RENDER VISUAL MAP PINS
        function renderMapPins() {
            const container = document.getElementById('mapPinsContainer');
            const filtered = getFilteredData();

            container.innerHTML = filtered.map(item => `
                <div onclick="openMapPinCard(${item.id})" class="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group" style="top: ${item.lat}px; left: ${item.lng}px;">
                    <div class="w-8 h-8 rounded-full bg-ayniOrange-600 border-2 border-white text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <i class="fa-solid ${getCategoryIcon(item.category)} text-xs"></i>
                    </div>
                    <div class="bg-slate-900 text-white text-[8px] font-bold px-1 rounded shadow whitespace-nowrap -mt-1 text-center">
                        ${item.title.split(' ')[0]} (${item.distance}m)
                    </div>
                </div>
            `).join('');
        }

        function getCategoryIcon(cat) {
            switch(cat) {
                case 'Gasfitero': return 'fa-wrench';
                case 'Electricista': return 'fa-bolt';
                case 'Costurera': return 'fa-scissors';
                case 'Mototaxista': return 'fa-motorcycle';
                case 'Bodega': return 'fa-basket-shopping';
                default: return 'fa-location-dot';
            }
        }

        function openMapPinCard(id) {
            const item = servicesData.find(s => s.id === id);
            const card = document.getElementById('mapFloatingCard');
            card.innerHTML = `
                <div class="flex items-center gap-2">
                    <img src="${item.photo}" class="w-12 h-12 rounded-xl object-cover shrink-0">
                    <div class="flex-1 min-w-0 text-xs">
                        <h4 class="font-bold text-slate-800 truncate">${item.title}</h4>
                        <p class="text-[10px] text-slate-600 mt-0.5">${item.category}</p>
                        <p class="text-[10px] text-slate-700 mt-1"><i class="fa-solid fa-location-dot text-ayniOrange-600 mr-1"></i>${item.zone}</p>
                        <p class="text-[10px] text-slate-500 mt-0.5">A ${item.distance} m de ti</p>
                    </div>
                    <a href="https://wa.me/${item.phone}" target="_blank" class="bg-emerald-600 text-white p-2 rounded-xl text-xs">
                        <i class="fa-brands fa-whatsapp text-sm"></i>
                    </a>
                </div>
            `;
            card.classList.remove('hidden');
        }

        // FILTER & SORT DATA
        function getFilteredData() {
            const searchVal = document.getElementById('searchInput').value.toLowerCase();
            const maxDistance = document.getElementById('distanceFilter').value;
            const sortBy = document.getElementById('sortFilter').value;

            return servicesData.filter(item => {
                const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
                const matchesSearch = item.title.toLowerCase().includes(searchVal) || 
                                      item.category.toLowerCase().includes(searchVal) ||
                                      item.description.toLowerCase().includes(searchVal);
                const matchesDist = maxDistance === 'all' || item.distance <= parseInt(maxDistance);
                return matchesCat && matchesSearch && matchesDist;
            }).sort((a, b) => {
                if (sortBy === 'distance') return a.distance - b.distance;
                if (sortBy === 'rating') return b.rating - a.rating;
                if (sortBy === 'verified') return b.reviewsCount - a.reviewsCount;
                return 0;
            });
        }

        function filterServices() {
            renderServicesList();
            renderMapPins();
        }

        function setCategory(cat) {
            selectedCategory = cat;
            document.querySelectorAll('.cat-chip').forEach(btn => {
                if(btn.innerText.includes(cat) || (cat === 'all' && btn.innerText === 'Todos')) {
                    btn.className = 'cat-chip active shrink-0 bg-slate-900 text-white px-3 py-1.5 rounded-full font-semibold';
                } else {
                    btn.className = 'cat-chip shrink-0 bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50 font-semibold';
                }
            });
            filterServices();
        }

        function clearSearch() {
            document.getElementById('searchInput').value = '';
            filterServices();
        }

        // VIEW MODE SWITCHING (LIST / MAP)
        function switchView(mode) {
            const listView = document.getElementById('listView');
            const mapView = document.getElementById('mapView');
            const btnList = document.getElementById('btnListView');
            const btnMap = document.getElementById('btnMapView');

            if (mode === 'list') {
                listView.classList.remove('hidden');
                mapView.classList.add('hidden');
                btnList.setAttribute('aria-pressed', 'true');
                btnMap.setAttribute('aria-pressed', 'false');
                btnList.className = 'px-2.5 py-1.5 rounded-md bg-white text-slate-800 shadow-sm transition-all flex items-center gap-1';
                btnMap.className = 'px-2.5 py-1.5 rounded-md text-slate-500 hover:text-slate-800 transition-all flex items-center gap-1';
            } else {
                listView.classList.add('hidden');
                mapView.classList.remove('hidden');
                btnMap.setAttribute('aria-pressed', 'true');
                btnList.setAttribute('aria-pressed', 'false');
                btnMap.className = 'px-2.5 py-1.5 rounded-md bg-white text-slate-800 shadow-sm transition-all flex items-center gap-1';
                btnList.className = 'px-2.5 py-1.5 rounded-md text-slate-500 hover:text-slate-800 transition-all flex items-center gap-1';
            }
        }

        function toggleAccessibility() {
            const enabled = document.getElementById('mobileFrame').classList.toggle('large-text');
            const button = document.getElementById('accessibilityBtn');
            button.setAttribute('aria-pressed', String(enabled));
            button.setAttribute('aria-label', enabled ? 'Desactivar texto grande' : 'Activar texto grande');
            showToast(enabled ? 'Texto grande activado.' : 'Texto grande desactivado.');
        }

        // SPEECH SYNTHESIS
        function speakText(text) {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'es-PE';
                window.speechSynthesis.speak(utterance);
            }
        }

        // ADD NEW SERVICE MODAL LOGIC
        function openAddServiceModal() {
            document.getElementById('addServiceModal').classList.remove('hidden');
        }

        function closeAddServiceModal() {
            document.getElementById('addServiceModal').classList.add('hidden');
        }

        function saveNewService(e) {
            e.preventDefault();
            const title = document.getElementById('newTitle').value;
            const category = document.getElementById('newCategory').value;
            const distance = parseInt(document.getElementById('newDistance').value);
            const phone = document.getElementById('newPhone').value;
            const desc = document.getElementById('newDesc').value;
            const photoInput = document.getElementById('newPhoto').value;

            const defaultPhoto = "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=400&q=80";

            const newObj = {
                id: servicesData.length + 1,
                title: title,
                category: category,
                distance: distance,
                zone: "Publicado recientemente en tu sector",
                rating: 5.0,
                reviewsCount: 1,
                phone: phone.startsWith('51') ? phone : `51${phone}`,
                photo: photoInput || defaultPhoto,
                description: desc,
                transport: "Cercano a tu zona residencial",
                lat: Math.floor(Math.random() * 200) + 80,
                lng: Math.floor(Math.random() * 200) + 80
            };

            servicesData.unshift(newObj);
            filterServices();
            closeAddServiceModal();
            showToast("¡Servicio publicado con éxito en la red vecinal!");
        }

        function toggleEmergencyMode(enable) {
            const normalView = document.getElementById('normalView');
            const emergencyView = document.getElementById('emergencyView');
            const mobileFrame = document.getElementById('mobileFrame');
            const sosTrigger = document.getElementById('sosTrigger');

            normalView.classList.toggle('hidden', enable);
            emergencyView.classList.toggle('hidden', !enable);
            mobileFrame.classList.toggle('emergency-mode', enable);
            sosTrigger.setAttribute('aria-pressed', String(enable));

            showToast(enable ? 'Modo emergencia activado.' : 'Modo normal restaurado.');
        }

        function sendEmergencyStatus(status) {
            showToast(`Estado enviado: "${status}". Notificando a tus guardianes del barrio.`);
        }

        function openZoneModal() {
            document.getElementById('zoneModal').classList.remove('hidden');
        }

        function closeZoneModal() {
            document.getElementById('zoneModal').classList.add('hidden');
        }

        function setZone(zoneName) {
            document.getElementById('currentZoneText').innerText = zoneName;
            closeZoneModal();
            showToast(`Barrio cambiado a: ${zoneName}`);
        }

        // NAVIGATION TABS
        function navigateTab(tab) {
            showToast(`Navegando a módulo: ${tab.toUpperCase()}`);
        }

        // MAP ZOOM SIMULATION
        function zoomMap(delta) {
            showToast(delta > 0 ? "Acercando vista de mapa..." : "Alejando vista de mapa...");
        }

        // TOAST NOTIFICATIONS
        function showToast(msg) {
            const toast = document.getElementById('toast');
            document.getElementById('toastMsg').children[1].innerText = msg;
            toast.classList.remove('hidden');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        }
        function hideToast() {
            document.getElementById('toast').classList.add('hidden');
        }
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
