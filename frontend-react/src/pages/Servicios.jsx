import LegacyPage from '../components/LegacyPage.jsx';
import { useNavigate } from 'react-router-dom';

const SCRIPTS = ["/legacy/Servicios.js"];

export default function Servicios() {
  const navigate = useNavigate();

  return (
    <LegacyPage page="servicios" scripts={SCRIPTS}>
      <>
<div id="mobileFrame" className="w-full sm:max-w-sm h-screen sm:h-[844px] bg-slate-50 sm:rounded-[42px] mobile-shadow overflow-hidden flex flex-col relative border-0 sm:border-[8px] border-slate-800">
        
        
        <div id="statusBar" className="brand-status-bar bg-brand-700 text-white px-6 pt-3 pb-1 flex justify-between items-center text-xs select-none transition-colors duration-300">
            <span className="font-semibold">9:41</span>
            <div className="flex items-center space-x-2">
                <i className="fa-solid fa-wifi"></i>
                <i className="fa-solid fa-signal"></i>
                <i className="fa-solid fa-battery-full"></i>
            </div>
        </div>

        
        <header id="mainHeader" className="brand-header bg-brand-700 text-white px-4 py-3 shadow-md flex items-center justify-between relative transition-colors duration-300">
            <div className="flex items-center space-x-3">
                <button id="appMenuTrigger" onClick={(event) => { toggleMenu(); }} className="p-2 rounded-full hover:bg-white/10 text-white focus:outline-none" aria-label="Abrir Menú" aria-controls="appMenu" aria-expanded="false">
                    <i className="fa-solid fa-bars text-xl"></i>
                </button>
                <div>
                    <div className="flex items-center space-x-1 cursor-pointer" onClick={(event) => { openZoneModal(); }}>
                        <span className="font-display font-bold text-xl tracking-tight text-white">sumayni</span>
                        <i className="fa-solid fa-chevron-down text-xs text-brand-100"></i>
                    </div>
                    <div className="text-[11px] text-brand-100 flex items-center space-x-1">
                        <i className="fa-solid fa-location-dot text-amber-300"></i>
                        <span id="currentZoneText" className="truncate max-w-[140px]">Urb. Bellamar, Chimbote</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <button id="accessibilityBtn" onClick={(event) => { toggleAccessibility(); }} title="Modo Accesibilidad (Texto Grande)" aria-label="Activar texto grande" aria-pressed="false" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
                    <i className="fa-solid fa-universal-access"></i>
                </button>
                <button id="sosTrigger" onClick={(event) => { toggleEmergencyMode(true); }} className="sos-btn bg-red-600 hover:bg-red-700 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white focus:outline-none" title="Activar Modo Emergencia" aria-label="Activar modo emergencia" aria-pressed="false">
                    <i className="fa-solid fa-triangle-exclamation text-lg"></i>
                </button>
            </div>
        </header>

        <div id="appMenu" className="hidden absolute inset-0 z-50 bg-slate-950/45" onClick={(event) => { closeMenu(); }}>
            <section role="dialog" aria-modal="true" aria-labelledby="appMenuTitle" className="w-[min(18rem,85%)] h-full bg-white shadow-2xl p-4 flex flex-col" onClick={(event) => { event.stopPropagation(); }}>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                        <h2 id="appMenuTitle" className="font-display font-bold text-slate-900">Menú sumayni</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Accesos de tu comunidad</p>
                    </div>
                    <button onClick={(event) => { closeMenu(); }} className="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-500" aria-label="Cerrar menú">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <nav aria-label="Opciones del menú" className="py-3 space-y-1">
                    <button onClick={(event) => { selectMenuOption('perfil'); }} className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm font-semibold text-slate-700 hover:bg-slate-100">
                        <i className="fa-solid fa-user w-5 text-center text-brand-600"></i><span>Perfil</span>
                    </button>
                    <button onClick={(event) => { selectMenuOption('configuracion'); }} className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm font-semibold text-slate-700 hover:bg-slate-100">
                        <i className="fa-solid fa-gear w-5 text-center text-brand-600"></i><span>Configuración</span>
                    </button>
                    <button onClick={(event) => { selectMenuOption('banco-tiempo'); }} className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm font-semibold text-slate-700 hover:bg-slate-100">
                        <i className="fa-solid fa-clock-rotate-left w-5 text-center text-brand-600"></i><span>Banco de Tiempo sumayni</span>
                    </button>
                </nav>
            </section>
        </div>

        <div id="profileModal" className="hidden absolute inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4" onClick={(event) => { closeProfileModal(); }}>
            <section role="dialog" aria-modal="true" aria-labelledby="profileTitle" className="w-full max-w-xs bg-white rounded-2xl p-4 shadow-2xl" onClick={(event) => { event.stopPropagation(); }}>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-3">
                        <span className="w-11 h-11 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-lg"><i className="fa-solid fa-user"></i></span>
                        <div><h2 id="profileTitle" className="font-display font-bold text-slate-900">Perfil vecinal</h2><p className="text-xs text-slate-500">Comunidad sumayni</p></div>
                    </div>
                    <button onClick={(event) => { closeProfileModal(); }} aria-label="Cerrar perfil" className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500"><i className="fa-solid fa-xmark"></i></button>
                </div>
                <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">Tu barrio</p>
                    <p id="profileZoneText" className="text-sm font-semibold text-slate-800 mt-1"></p>
                </div>
                <button onClick={(event) => { closeProfileModal(); }} className="w-full mt-4 bg-brand-700 hover:bg-brand-800 text-white font-bold py-2.5 rounded-xl text-sm">Listo</button>
            </section>
        </div>

        
        <div className="bg-white px-4 pt-3 pb-2 flex items-center justify-between gap-3">
            <div className="min-w-0">
                <h2 className="font-display font-bold text-base text-slate-900">Servicios del barrio</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Personas y negocios recomendados cerca de ti.</p>
                <p id="resultsCount" className="text-[10px] text-slate-400 mt-1" aria-live="polite"></p>
            </div>
            
            
            <div className="bg-slate-100 p-0.5 rounded-lg flex items-center text-xs font-semibold shrink-0">
                <button id="btnListView" onClick={(event) => { switchView('list'); }} aria-pressed="true" className="px-2.5 py-1.5 rounded-md bg-white text-slate-800 shadow-sm transition-all flex items-center gap-1">
                    <i className="fa-solid fa-list-ul"></i>
                    <span>Lista</span>
                </button>
                <button id="btnMapView" onClick={(event) => { switchView('map'); }} aria-pressed="false" className="px-2.5 py-1.5 rounded-md text-slate-500 hover:text-slate-800 transition-all flex items-center gap-1">
                    <i className="fa-solid fa-map-marked-alt"></i>
                    <span>Mapa</span>
                </button>
            </div>
        </div>

        
        <div className="bg-white px-4 pb-3 space-y-2.5 border-b border-slate-200">
            
            <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-400 text-sm"></i>
                <input type="search" id="searchInput" onInput={(event) => { filterServices(); }} aria-label="Buscar servicios" placeholder="¿Qué servicio necesitas?" className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <button onClick={(event) => { clearSearch(); }} aria-label="Limpiar búsqueda" className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 p-1">
                    <i className="fa-solid fa-xmark text-sm"></i>
                </button>
            </div>

            
            <div className="flex items-center gap-2 text-xs">
                <label className="flex flex-1 min-w-0 items-center gap-2 bg-white px-2.5 py-2 rounded-lg border border-slate-200 text-slate-600">
                    <i className="fa-solid fa-location-dot text-slate-400"></i>
                    <select id="distanceFilter" onChange={(event) => { filterServices(); }} aria-label="Filtrar por distancia" className="w-full bg-transparent focus:outline-none cursor-pointer text-slate-700">
                        <option value="all">Todas las distancias</option>
                        <option value="500">Hasta 500 m</option>
                        <option value="1000">Hasta 1 km</option>
                        <option value="3000">Hasta 3 km</option>
                    </select>
                </label>
                <label className="flex flex-1 min-w-0 items-center gap-2 bg-white px-2.5 py-2 rounded-lg border border-slate-200 text-slate-600">
                    <i className="fa-solid fa-arrow-down-short-wide text-slate-400"></i>
                    <select id="sortFilter" onChange={(event) => { filterServices(); }} aria-label="Ordenar servicios" className="w-full bg-transparent focus:outline-none cursor-pointer text-slate-700">
                        <option value="distance">Más cercano</option>
                        <option value="rating">Mejor valorado</option>
                        <option value="verified">Más recomendado</option>
                    </select>
                </label>
            </div>

            
            <div className="service-scroll flex gap-2 overflow-x-auto text-xs font-medium">
                <button onClick={(event) => { setCategory('all'); }} className="cat-chip active shrink-0 bg-slate-900 text-white px-3 py-1.5 rounded-full">Todos</button>
                <button onClick={(event) => { setCategory('Gasfitero'); }} className="cat-chip shrink-0 bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50">Gasfitero</button>
                <button onClick={(event) => { setCategory('Electricista'); }} className="cat-chip shrink-0 bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50">Electricista</button>
                <button onClick={(event) => { setCategory('Costurera'); }} className="cat-chip shrink-0 bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50">Costurera</button>
                <button onClick={(event) => { setCategory('Mototaxista'); }} className="cat-chip shrink-0 bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50">Mototaxista</button>
                <button onClick={(event) => { setCategory('Bodega'); }} className="cat-chip shrink-0 bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50">Bodega</button>
            </div>
        </div>

        
        <main id="normalView" className="flex-1 overflow-y-auto relative bg-slate-50">
            
            
            <div id="listView" className="p-3 space-y-3">
                
            </div>

            
            <div id="mapView" className="hidden absolute inset-0 bg-slate-200 relative overflow-hidden">
                
                <div className="dot-pattern absolute inset-0 opacity-20"></div>
                
                
                <svg className="absolute inset-0 w-full h-full stroke-slate-400 fill-slate-300/70" xmlns="http://www.w3.org/2000/svg">
                    <rect x="20" y="40" width="120" height="90" rx="8" />
                    <rect x="160" y="40" width="180" height="90" rx="8" />
                    <rect x="20" y="160" width="140" height="180" rx="8" />
                    <rect x="180" y="160" width="160" height="110" rx="8" />
                    <rect x="180" y="290" width="160" height="160" rx="8" />
                    <path d="M 0 140 Q 180 140 360 140" stroke="rgb(var(--color-sumayni-orange-700))" strokeWidth="6" fill="none" />
                    <path d="M 150 0 L 150 500" stroke="rgb(var(--color-slate-500))" strokeWidth="8" fill="none" />
                </svg>

                
                <div className="absolute top-[210px] left-[135px] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white text-[10px] shadow-lg">
                        <i className="fa-solid fa-street-view"></i>
                    </div>
                    <span className="bg-blue-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow mt-1">Tú estás aquí</span>
                </div>

                
                <div id="mapPinsContainer" className="absolute inset-0">
                    
                </div>

                
                <div id="mapFloatingCard" className="hidden absolute bottom-3 left-3 right-3 bg-white p-3 rounded-2xl shadow-2xl border-2 border-sumayniOrange-500 z-30 transition-all">
                    
                </div>

                
                <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
                    <button onClick={(event) => { zoomMap(1); }} className="w-8 h-8 bg-white text-slate-700 font-bold rounded-xl shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                        <i className="fa-solid fa-plus text-xs"></i>
                    </button>
                    <button onClick={(event) => { zoomMap(-1); }} className="w-8 h-8 bg-white text-slate-700 font-bold rounded-xl shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                        <i className="fa-solid fa-minus text-xs"></i>
                    </button>
                </div>
            </div>

        </main>

        <main id="emergencyView" className="hidden flex-1 overflow-y-auto bg-slate-950 p-4 space-y-4 text-white">
            <div className="bg-red-700 rounded-2xl p-4 text-white shadow-xl border-2 border-red-500 text-center">
                <i className="fa-solid fa-triangle-exclamation text-4xl mb-2 text-yellow-300"></i>
                <h2 className="text-xl font-black uppercase tracking-wider">¡MODO EMERGENCIA ACTIVADO!</h2>
                <p className="text-xs font-medium text-red-100 mt-1">Red vecinal de apoyo y servicios de emergencia.</p>
            </div>
            <section className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 text-center">¿Cómo puedes responder?</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={(event) => { sendEmergencyStatus('Estoy Bien'); }} className="bg-emerald-700 hover:bg-emerald-800 p-3 rounded-xl text-white font-bold text-xs">Estoy bien</button>
                    <button onClick={(event) => { sendEmergencyStatus('Necesito Ayuda'); }} className="bg-red-600 hover:bg-red-700 p-3 rounded-xl text-white font-bold text-xs">Necesito ayuda</button>
                    <button onClick={(event) => { sendEmergencyStatus('Puedo Ayudar'); }} className="bg-blue-700 hover:bg-blue-800 p-3 rounded-xl text-white font-bold text-xs">Puedo ayudar</button>
                    <button onClick={(event) => { showToast('Directorio local de emergencias disponible.'); }} className="bg-slate-700 hover:bg-slate-600 p-3 rounded-xl text-white font-bold text-xs">Directorio local</button>
                </div>
            </section>
            <button onClick={(event) => { toggleEmergencyMode(false); }} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold py-3 rounded-xl border border-slate-600 text-xs">
                <i className="fa-solid fa-power-off mr-1"></i> Desactivar modo emergencia
            </button>
        </main>

        
        <nav id="bottomNav" aria-label="Navegación principal" className="app-bottom-nav bg-white border-t border-slate-200 px-1 py-2 flex justify-between items-center text-slate-500 transition-colors duration-300">
            <button onClick={() => navigate('/sumayni')} className="nav-item flex flex-1 min-w-0 flex-col items-center hover:text-brand-600" aria-label="Inicio">
                <i className="fa-solid fa-house text-sm"></i>
                <span className="text-[9px] font-medium mt-0.5 leading-tight">Inicio</span>
            </button>
            <button className="nav-item active flex flex-1 min-w-0 flex-col items-center text-brand-600" aria-current="page" aria-label="Servicios">
                <i className="fa-solid fa-wrench text-sm"></i>
                <span className="text-[9px] font-bold mt-0.5 leading-tight">Servicios</span>
            </button>
            <button onClick={(event) => { openAddServiceModal(); }} aria-label="Publicar servicio" title="Publicar servicio" className="flex flex-col items-center justify-center w-9 h-9 shrink-0 rounded-full bg-brand-600 text-white shadow-md -mt-3 hover:bg-brand-700 active:scale-95 transition-transform">
                <i className="fa-solid fa-plus text-sm"></i>
            </button>
            <button onClick={() => navigate('/favores')} className="nav-item flex flex-1 min-w-0 flex-col items-center hover:text-brand-600" aria-label="Favores">
                <i className="fa-solid fa-handshake text-sm"></i>
                <span className="text-[9px] font-medium mt-0.5 leading-tight">Favores</span>
            </button>
            <button onClick={() => navigate('/mapa')} className="nav-item flex flex-1 min-w-0 flex-col items-center hover:text-brand-600" aria-label="Mapa">
                <i className="fa-solid fa-map-location-dot text-sm"></i>
                <span className="text-[9px] font-medium mt-0.5 leading-tight">Mapa</span>
            </button>
        </nav>

        <div id="zoneModal" className="hidden absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xs rounded-2xl p-4 space-y-3">
                <h3 className="font-bold text-slate-800 text-sm text-center">Selecciona tu Barrio</h3>
                <div className="space-y-2 text-xs">
                    <button onClick={(event) => { setZone('Urb. Bellamar, Chimbote'); }} className="w-full p-2.5 rounded-xl bg-purple-50 text-brand-700 font-bold border border-purple-200 text-left">Urb. Bellamar</button>
                    <button onClick={(event) => { setZone('Urb. Buenos Aires, Nuevo Chimbote'); }} className="w-full p-2.5 rounded-xl bg-slate-50 text-slate-700 font-medium border border-slate-200 text-left">Urb. Buenos Aires</button>
                    <button onClick={(event) => { setZone('Casco Urbano, Chimbote'); }} className="w-full p-2.5 rounded-xl bg-slate-50 text-slate-700 font-medium border border-slate-200 text-left">Casco Urbano</button>
                </div>
                <button onClick={(event) => { closeZoneModal(); }} className="w-full bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs">Cerrar</button>
            </div>
        </div>

        
        <div id="addServiceModal" className="hidden absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full rounded-t-3xl sm:rounded-2xl p-4 space-y-3 animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <i className="fa-solid fa-store text-sumayniOrange-600"></i> Publicar Servicio o Negocio
                    </h3>
                    <button onClick={(event) => { closeAddServiceModal(); }} className="text-slate-400 hover:text-slate-600">
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>

                <form onSubmit={(event) => { saveNewService(event); }} className="space-y-3 text-xs">
                    <div>
                        <label className="font-bold text-slate-700 block mb-1">1. Título del servicio o Nombre</label>
                        <input type="text" id="newTitle" required placeholder="Ej: Don Pedro - Electricista de Emergencia" className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sumayniOrange-500 focus:outline-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="font-bold text-slate-700 block mb-1">Categoría</label>
                            <select id="newCategory" className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sumayniOrange-500 focus:outline-none">
                                <option value="Gasfitero">🔧 Gasfitero</option>
                                <option value="Electricista">⚡ Electricista</option>
                                <option value="Costurera">🧵 Costurera</option>
                                <option value="Mototaxista">🛺 Mototaxista</option>
                                <option value="Bodega">🛒 Bodega</option>
                            </select>
                        </div>
                        <div>
                            <label className="font-bold text-slate-700 block mb-1">Distancia estimada</label>
                            <select id="newDistance" className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sumayniOrange-500 focus:outline-none">
                                <option value="180">a 180 m (Cerca)</option>
                                <option value="450">a 450 m</option>
                                <option value="800">a 800 m</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="font-bold text-slate-700 block mb-1">WhatsApp de contacto direct</label>
                        <input type="tel" id="newPhone" required placeholder="Ej: 987654321" className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sumayniOrange-500 focus:outline-none" />
                    </div>

                    <div>
                        <label className="font-bold text-slate-700 block mb-1">Descripción corta del trabajo</label>
                        <textarea id="newDesc" rows="2" required placeholder="Instalaciones eléctricas, fugas de agua, reparaciones..." className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sumayniOrange-500 focus:outline-none"></textarea>
                    </div>

                    <div>
                        <label className="font-bold text-slate-700 block mb-1">Foto del prestador/negocio (URL opcional)</label>
                        <input type="url" id="newPhoto" placeholder="Dejar en blanco para foto predeterminada" className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sumayniOrange-500 focus:outline-none" />
                    </div>

                    <button type="submit" className="w-full bg-sumayniOrange-600 hover:bg-sumayniOrange-700 text-white font-bold py-2.5 rounded-xl shadow-md text-xs">
                        <i className="fa-solid fa-check-circle mr-1"></i> Confirmar y Publicar Gratis
                    </button>
                </form>
            </div>
        </div>

        
        <div id="toast" className="hidden absolute top-14 left-4 right-4 bg-slate-900 text-white text-xs px-3 py-2 rounded-xl shadow-xl z-50 flex items-center justify-between transition-all border border-slate-700">
            <span id="toastMsg" className="flex items-center gap-2">
                <i className="fa-solid fa-circle-check text-emerald-400"></i>
                <span>Mensaje</span>
            </span>
            <button onClick={(event) => { hideToast(); }} className="text-slate-400 hover:text-white"><i className="fa-solid fa-xmark"></i></button>
        </div>

    </div>
      </>
    </LegacyPage>
  );
}
