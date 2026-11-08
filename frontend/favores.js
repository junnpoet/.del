// Emergency Toggle
        function toggleEmergencyMode(enable) {
            const normalView = document.getElementById('normalView');
            const emergencyView = document.getElementById('emergencyView');
            const mobileFrame = document.getElementById('mobileFrame');
            const sosTrigger = document.getElementById('sosTrigger');

            if (enable) {
                normalView.classList.add('hidden');
                emergencyView.classList.remove('hidden');
                mobileFrame.classList.add('emergency-mode');
                sosTrigger.setAttribute('aria-pressed', 'true');
                showToast(" MODO EMERGENCIA ACTIVADO.");
            } else {
                emergencyView.classList.add('hidden');
                normalView.classList.remove('hidden');
                mobileFrame.classList.remove('emergency-mode');
                sosTrigger.setAttribute('aria-pressed', 'false');
                showToast("Modo normal restaurado.");
            }
        }

        let selectedFavorCategory = 'all';
        function filterFavors(category = selectedFavorCategory) {
            selectedFavorCategory = category;
            const query = document.getElementById('favorSearchInput').value.trim().toLocaleLowerCase('es');
            const cards = document.querySelectorAll('.favor-card');
            let visibleCount = 0;

            document.querySelectorAll('.favor-filter-chip').forEach(button => {
                const isActive = button.dataset.category === selectedFavorCategory;
                button.setAttribute('aria-pressed', String(isActive));
                button.classList.toggle('border', !isActive);
            });

            cards.forEach(card => {
                const matchesCategory = selectedFavorCategory === 'all' || card.classList.contains(`category-${selectedFavorCategory}`);
                const matchesQuery = card.innerText.toLocaleLowerCase('es').includes(query);
                const isVisible = matchesCategory && matchesQuery;
                card.classList.toggle('hidden', !isVisible);
                if (isVisible) visibleCount++;
            });

            document.getElementById('favorResultsCount').textContent =
                `${visibleCount} ${visibleCount === 1 ? 'favor encontrado' : 'favores encontrados'}`;
            document.getElementById('favorEmptyState').classList.toggle('hidden', visibleCount > 0);
        }

        function clearFavorSearch() {
            document.getElementById('favorSearchInput').value = '';
            filterFavors();
        }

        // Text Accessibility
        let isLargeText = false;
        function toggleAccessibility() {
            const frame = document.getElementById('mobileFrame');
            const button = document.getElementById('accessibilityBtn');
            isLargeText = !isLargeText;
            button.setAttribute('aria-pressed', String(isLargeText));
            button.setAttribute('aria-label', isLargeText ? 'Desactivar texto grande' : 'Activar texto grande');
            if (isLargeText) {
                frame.classList.add('large-text');
                showToast("Modo Accesibilidad: Texto grande activado.");
            } else {
                frame.classList.remove('large-text');
                showToast("Texto normal.");
            }
        }

        // Voice Reader
        function speakText(text) {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'es-PE';
                window.speechSynthesis.speak(utterance);
                showToast("Leyendo en voz alta...");
            } else {
                showToast("Voz no disponible en este navegador.");
            }
        }

        // Request Favor Action
        function requestFavor(favorName) {
            showToast(`Solicitando: "${favorName}". Abrirás contacto directo.`);
            setTimeout(() => {
                window.open('https://wa.me/', '_blank');
            }, 1000);
        }

        // Publish Favor Modal
        function openPublishFavorModal() {
            document.getElementById('publishFavorModal').classList.remove('hidden');
        }
        function closePublishFavorModal() {
            document.getElementById('publishFavorModal').classList.add('hidden');
        }
        function submitNewFavor() {
            const title = document.getElementById('favorTitleInput').value;
            const category = document.getElementById('favorCategorySelect').value;
            if (!title.trim()) {
                showToast("Por favor describe el favor.");
                return;
            }
            closePublishFavorModal();
            
            // Add the new favor using the same horizontal layout as existing cards
            const grid = document.getElementById('favorsGrid');
            const newCard = document.createElement('div');
            newCard.className = `favor-card category-${category} bg-white rounded-xl border border-slate-200 border-l-4 border-l-orange-600 overflow-hidden shadow-lg shadow-slate-300/50 flex hover:shadow-xl hover:shadow-slate-400/50 transition-shadow`;
            newCard.innerHTML = `
                <div class="relative w-28 shrink-0">
                    <img src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80" alt="" class="w-full h-full min-h-[148px] object-cover">
                    <span class="absolute top-1.5 left-1.5 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                        DISPONIBLE
                    </span>
                </div>
                <div class="p-3 flex-1 min-w-0 flex flex-col justify-between space-y-3">
                    <div>
                        <span class="text-[9px] font-bold text-orange-600 block uppercase">${category}</span>
                        <h3 class="text-xs font-bold text-slate-800 leading-tight">${title}</h3>
                        <p class="text-[10px] text-slate-600 mt-1">Publicado recien por ti.</p>
                    </div>
                    <div class="pt-2 border-t border-slate-200 flex items-center justify-between">
                        <span class="text-[9px] text-slate-500 font-medium">Tú</span>
                        <span class="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded">Activo</span>
                    </div>
                </div>
            `;
            grid.prepend(newCard);
            document.getElementById('favorTitleInput').value = '';
            filterFavors();
            showToast("¡Favor publicado en el muro vecinal!");
        }

        // Neighborhood Resource Modal
        function showResourceDetails(title, owner) {
            document.getElementById('resourceTitle').innerText = title;
            document.getElementById('resourceOwner').innerText = owner;
            document.getElementById('resourceModal').classList.remove('hidden');
        }
        function closeResourceModal() {
            document.getElementById('resourceModal').classList.add('hidden');
        }

        function sendEmergencyStatus(msg) {
            showToast(`Reportado: ${msg}. Avisando al comité vecinal.`);
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
                'banco-tiempo': 'Banco de Tiempo sumayni: próximamente.'
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

        function showToast(msg) {
            const toast = document.getElementById('toast');
            document.getElementById('toastText').innerText = msg;
            toast.classList.remove('hidden');
            setTimeout(() => { toast.classList.add('hidden'); }, 3000);
        }

        filterFavors();
