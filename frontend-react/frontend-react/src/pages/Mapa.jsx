import LegacyPage from '../components/LegacyPage.jsx';

const SCRIPTS = ["/google-maps-config.js", "/legacy/mapa.js"];

export default function Mapa() {
  return (
    <LegacyPage page="mapa" scripts={SCRIPTS}>
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
                        <span id="currentZoneText" className="truncate max-w-[140px]">Buscando tu ubicación...</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <button id="accessibilityBtn" onClick={(event) => { toggleAccessibility(); }} title="Modo Accesibilidad (Texto Grande)" aria-label="Activar texto grande" aria-pressed="false" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
                    <i className="fa-solid fa-universal-access"></i>
                </button>
                <button id="sosTrigger" onClick={(event) => { toggleEmergencyMode(true); }} className="sos-btn bg-red-600 hover:bg-red-700 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white focus:outline-none" title="Activar Modo Emergencia" aria-label="Activar modo emergencia">
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

        
        <section className="bg-white px-4 pt-3 pb-3 border-b border-slate-200 shrink-0" aria-label="Buscar y filtrar el mapa">
            <div className="mb-2.5">
                <h2 className="font-display font-bold text-base text-slate-900">Mapa y recursos</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Lo que tu barrio tiene cerca, y dónde estar a salvo.</p>
                <p id="resultsCount" className="text-[10px] text-slate-400 mt-1" aria-live="polite"></p>
            </div>

            <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-400 text-sm"></i>
                <input type="search" id="searchInput" onInput={(event) => { renderAll(); }} aria-label="Buscar en el mapa" placeholder="Generador, botiquín, olla común..." className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <button onClick={(event) => { clearSearch(); }} aria-label="Limpiar búsqueda" className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 p-1">
                    <i className="fa-solid fa-xmark text-sm"></i>
                </button>
            </div>

            <div className="chip-scroll flex gap-2 overflow-x-auto text-xs font-medium mt-2.5" role="group" aria-label="Categorías del mapa">
                <button type="button" data-cat="all" onClick={(event) => { setCategory('all'); }} className="map-chip shrink-0 bg-slate-900 text-white px-3 py-1.5 rounded-full font-semibold">Todos</button>
                <button type="button" data-cat="recurso" onClick={(event) => { setCategory('recurso'); }} className="map-chip shrink-0 bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full font-semibold hover:bg-slate-50">Recursos</button>
                <button type="button" data-cat="voluntariado" onClick={(event) => { setCategory('voluntariado'); }} className="map-chip shrink-0 bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full font-semibold hover:bg-slate-50">Voluntariado</button>
                <button type="button" data-cat="seguro" onClick={(event) => { setCategory('seguro'); }} className="map-chip shrink-0 bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full font-semibold hover:bg-slate-50">Zonas seguras</button>
                <button type="button" data-cat="riesgo" onClick={(event) => { setCategory('riesgo'); }} className="map-chip shrink-0 bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full font-semibold hover:bg-slate-50">Riesgo</button>
            </div>
        </section>

        
        <main id="mainView" className="flex-1 overflow-y-auto bg-slate-50 p-3 space-y-3">

            
            <section id="emergencyBanner" className="hidden bg-red-700 rounded-2xl p-3 text-white shadow-xl border-2 border-red-500">
                <div className="flex items-center gap-2 mb-2">
                    <i className="fa-solid fa-triangle-exclamation text-2xl text-yellow-300"></i>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wider">Modo emergencia</h3>
                        <p className="text-[11px] text-red-100">Mostrando zonas seguras. Avisa cómo estás.</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={(event) => { sendEmergencyStatus('Estoy Bien'); }} className="bg-emerald-700 hover:bg-emerald-800 p-2.5 rounded-xl text-white font-bold text-xs">Estoy bien</button>
                    <button onClick={(event) => { sendEmergencyStatus('Necesito Ayuda'); }} className="bg-red-900 hover:bg-red-950 p-2.5 rounded-xl text-white font-bold text-xs border border-red-400">Necesito ayuda</button>
                    <button onClick={(event) => { sendEmergencyStatus('Puedo Ayudar'); }} className="bg-blue-700 hover:bg-blue-800 p-2.5 rounded-xl text-white font-bold text-xs">Puedo ayudar</button>
                    <button onClick={(event) => { sendEmergencyStatus('Ahí Llevándola'); }} className="bg-amber-600 hover:bg-amber-700 p-2.5 rounded-xl text-white font-bold text-xs">Ahí llevándola</button>
                </div>
                <button onClick={(event) => { toggleEmergencyMode(false); }} className="w-full mt-2 bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-xl text-[11px] border border-white/30">
                    <i className="fa-solid fa-power-off mr-1"></i> Desactivar modo emergencia
                </button>
            </section>

            
            <section className="relative h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-lg shadow-slate-300/50 bg-slate-200" aria-label="Mapa del barrio">
                <div id="map" className="absolute inset-0"></div>

                
                <div id="mapMessage" className="hidden absolute inset-0 z-40 bg-slate-100 flex flex-col items-center justify-center text-center p-5">
                    <i className="fa-solid fa-map-location-dot text-4xl text-slate-300 mb-2"></i>
                    <p id="mapMessageTitle" className="text-xs font-bold text-slate-700"></p>
                    <p id="mapMessageText" className="text-[11px] text-slate-500 mt-1 leading-snug"></p>
                    <p className="text-[10px] text-slate-400 mt-2">La lista de abajo sigue funcionando.</p>
                </div>

                
                <div id="zoneChip" className="hidden absolute top-3 left-3 z-30 max-w-[62%] bg-white/95 border border-red-200 rounded-xl shadow-md px-2.5 py-1.5">
                    <p className="text-[11px] font-bold text-slate-800 flex items-center gap-1 min-w-0">
                        <span className="inline-block w-3 border-t-2 border-dashed border-red-600 shrink-0"></span>
                        <span id="zoneChipName" className="truncate">Tu barrio</span>
                    </p>
                    <p id="zoneChipSrc" className="text-[9px] text-slate-500 leading-tight"></p>
                </div>

                
                <button onClick={(event) => { locate(true); }} aria-label="Ir a mi ubicación" title="Mi ubicación" className="absolute top-3 right-3 z-30 w-9 h-9 bg-white text-blue-600 rounded-xl shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95">
                    <i className="fa-solid fa-location-crosshairs"></i>
                </button>
                <button onClick={(event) => { startDrawing(); }} aria-label="Dibujar los límites de mi barrio" title="Dibujar los límites de mi barrio" className="absolute top-14 right-3 z-30 w-9 h-9 bg-white text-red-600 rounded-xl shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95">
                    <i className="fa-solid fa-draw-polygon"></i>
                </button>

                
                <div id="drawBar" className="hidden absolute bottom-2 left-2 right-2 z-40 bg-white rounded-2xl shadow-2xl border-2 border-red-500 p-2.5">
                    <p className="text-[11px] font-bold text-slate-800 mb-0.5">Dibuja tu barrio</p>
                    <p id="drawHint" className="text-[10px] text-slate-500 leading-snug mb-2">Toca el mapa en cada esquina del límite de tu barrio (mínimo 3 puntos).</p>
                    <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold">
                        <button onClick={(event) => { undoDraw(); }} className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded-lg"><i className="fa-solid fa-rotate-left mr-1"></i>Deshacer</button>
                        <button onClick={(event) => { cancelDraw(); }} className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded-lg">Cancelar</button>
                        <button onClick={(event) => { finishDraw(); }} className="bg-red-600 hover:bg-red-700 text-white py-1.5 rounded-lg"><i className="fa-solid fa-check mr-1"></i>Listo</button>
                    </div>
                </div>

                
                <div id="mapFloatingCard" className="hidden absolute bottom-2 left-2 right-2 bg-white p-3 rounded-2xl shadow-2xl border-2 border-sumayniOrange-500 z-30"></div>
            </section>

            
            <div id="listView" className="space-y-3"></div>

        </main>

        
        <nav id="bottomNav" aria-label="Navegación principal" className="app-bottom-nav bg-white border-t border-slate-200 px-1 py-2 flex justify-between items-center text-slate-500 transition-colors duration-300">
            <button onClick={(event) => { window.location.href='/sumayni'; }} className="nav-item flex flex-1 min-w-0 flex-col items-center hover:text-brand-600" aria-label="Inicio">
                <i className="fa-solid fa-house text-sm"></i>
                <span className="text-[9px] font-medium mt-0.5 leading-tight">Inicio</span>
            </button>
            <button onClick={(event) => { window.location.href='/servicios'; }} className="nav-item flex flex-1 min-w-0 flex-col items-center hover:text-brand-600" aria-label="Servicios">
                <i className="fa-solid fa-wrench text-sm"></i>
                <span className="text-[9px] font-medium mt-0.5 leading-tight">Servicios</span>
            </button>
            <button onClick={(event) => { openAddModal(); }} aria-label="Marcar en el mapa" title="Marcar en el mapa" className="flex flex-col items-center justify-center w-9 h-9 shrink-0 rounded-full bg-brand-600 text-white shadow-md -mt-3 hover:bg-brand-700 active:scale-95 transition-transform">
                <i className="fa-solid fa-plus text-sm"></i>
            </button>
            <button onClick={(event) => { window.location.href='/favores'; }} className="nav-item flex flex-1 min-w-0 flex-col items-center hover:text-brand-600" aria-label="Favores">
                <i className="fa-solid fa-handshake text-sm"></i>
                <span className="text-[9px] font-medium mt-0.5 leading-tight">Favores</span>
            </button>
            <button className="nav-item active flex flex-1 min-w-0 flex-col items-center text-brand-600" aria-current="page" aria-label="Mapa">
                <i className="fa-solid fa-map-location-dot text-sm"></i>
                <span className="text-[9px] font-bold mt-0.5 leading-tight">Mapa</span>
            </button>
        </nav>

        
        <div id="zoneModal" className="hidden absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xs rounded-2xl p-4 space-y-3">
                <h3 className="font-bold text-slate-800 text-sm text-center">Tu barrio</h3>
                <p id="zoneModalName" className="text-xs font-bold text-brand-700 text-center"></p>
                <p className="text-[11px] text-slate-500 text-center">La app usa tu ubicación para delimitar el barrio donde estás. Puedes corregir sus límites.</p>
                <button onClick={(event) => { redetectZone(); }} className="w-full p-2.5 rounded-xl bg-purple-50 text-brand-700 font-bold border border-purple-200 text-xs flex items-center justify-center gap-2">
                    <i className="fa-solid fa-location-crosshairs"></i> Detectar mi barrio de nuevo
                </button>
                <button onClick={(event) => { closeZoneModal(); startDrawing(); }} className="w-full p-2.5 rounded-xl bg-red-50 text-red-700 font-bold border border-red-200 text-xs flex items-center justify-center gap-2">
                    <i className="fa-solid fa-draw-polygon"></i> Dibujar los límites yo mismo
                </button>
                <button onClick={(event) => { closeZoneModal(); }} className="w-full bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs">Cerrar</button>
            </div>
        </div>

        
        <div id="addModal" className="hidden absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full rounded-t-3xl sm:rounded-2xl p-4 space-y-3 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <i className="fa-solid fa-map-pin text-sumayniOrange-600"></i> Marcar en el mapa
                    </h3>
                    <button onClick={(event) => { closeAddModal(); }} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar">
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>

                <form onSubmit={(event) => { saveNewItem(event); }} className="space-y-3 text-xs">
                    <div>
                        <label className="font-bold text-slate-700 block mb-1">1. ¿Qué vas a marcar?</label>
                        <select id="newType" className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sumayniOrange-500 focus:outline-none">
                            <option value="recurso">🧰 Un recurso que puedo compartir</option>
                            <option value="voluntariado">🍲 Voluntariado u olla común</option>
                            <option value="seguro">🟢 Zona segura o punto de reunión</option>
                            <option value="riesgo">⚠️ Zona de riesgo</option>
                        </select>
                    </div>

                    <div>
                        <label className="font-bold text-slate-700 block mb-1">2. Nombre corto</label>
                        <input type="text" id="newTitle" required placeholder="Ej: Escalera de 3 metros" className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sumayniOrange-500 focus:outline-none" />
                    </div>

                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <i className="fa-solid fa-location-dot text-blue-600"></i> Se marcará en tu ubicación actual.
                    </p>

                    <button type="submit" className="w-full bg-sumayniOrange-600 hover:bg-sumayniOrange-700 text-white font-bold py-2.5 rounded-xl shadow-md text-xs">
                        <i className="fa-solid fa-check-circle mr-1"></i> 3. Marcar en mi barrio
                    </button>
                </form>
            </div>
        </div>

        
        <div id="toast" className="hidden absolute top-14 left-4 right-4 bg-slate-900 text-white text-xs px-3 py-2 rounded-xl shadow-xl z-50 flex items-center justify-between border border-slate-700">
            <span className="flex items-center gap-2">
                <i className="fa-solid fa-circle-check text-emerald-400"></i>
                <span id="toastMsg">Mensaje</span>
            </span>
            <button onClick={(event) => { hideToast(); }} className="text-slate-400 hover:text-white" aria-label="Cerrar aviso"><i className="fa-solid fa-xmark"></i></button>
        </div>

    </div>
      </>
    </LegacyPage>
  );
}
