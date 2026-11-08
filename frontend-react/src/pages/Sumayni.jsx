import LegacyPage from '../components/LegacyPage.jsx';
import { useNavigate } from 'react-router-dom';

const SCRIPTS = ["/legacy/Sumayni.js"];

export default function Sumayni() {
  const navigate = useNavigate();

  return (
    <LegacyPage page="sumayni" scripts={SCRIPTS}>
      <>
<div id="mobileFrame" className="w-full sm:max-w-sm h-screen sm:h-[844px] bg-white sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative border-0 sm:border-[8px] border-slate-800">

        
        <div id="statusBar" className="brand-status-bar text-white px-6 pt-3 pb-1 flex justify-between items-center text-xs select-none transition-colors duration-300">
            <span className="font-semibold">9:41</span>
            <div className="flex items-center space-x-2">
                <i className="fa-solid fa-wifi"></i>
                <i className="fa-solid fa-signal"></i>
                <i className="fa-solid fa-battery-full"></i>
            </div>
        </div>

        
        <header id="mainHeader" className="brand-header text-white px-4 py-3 shadow-md flex items-center justify-between relative transition-colors duration-300">
            
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

        
        <main id="normalView" className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-4">

            
            <div className="bg-gradient-to-r from-brand-600 to-purple-800 rounded-2xl p-4 text-white shadow-lg flex justify-between items-center relative overflow-hidden">
                <div className="relative z-10">
                    <span className="bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Comunidad
                        Activa</span>
                    <h2 className="text-lg font-bold mt-1">¿Qué necesitas hoy?</h2>
                    <p className="text-xs text-purple-100">Encuentra ayuda o brinda tu apoyo en tu barrio.</p>
                </div>
                <button onClick={(event) => { openPublishModal(); }} className="relative z-10 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-3 py-2.5 rounded-xl shadow-md flex items-center space-x-1 text-xs shrink-0 active:scale-95 transition-transform">
                    <i className="fa-solid fa-plus-circle text-base"></i>
                    <span>Publicar</span>
                </button>
                <i className="fa-solid fa-hand-holding-heart absolute -right-3 -bottom-3 text-7xl text-white/10 pointer-events-none"></i>
            </div>

            
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 px-1">Módulos Principales</h3>
                <div className="grid grid-cols-3 gap-2.5">
                    
                    <button onClick={(event) => { navegarConToast(); }} className="bg-white p-3 rounded-2xl shadow-xl shadow-slate-500/30 border border-blue-500 flex flex-col items-center text-center hover:shadow-2xl hover:shadow-blue-500/40 transition-all active:scale-95 group">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <i className="fa-solid fa-wrench"></i>
                        </div>
                        <span className="text-xs font-bold text-slate-700 leading-tight">Servicios de Proximidad</span>
                        <span className="text-[9px] text-slate-400 mt-1">Gasfitero, Bodega</span>
                    </button>

                    
                    <button onClick={() => navigate('/favores')} className="bg-white p-3 rounded-2xl shadow-xl shadow-slate-500/30 border border-purple-500 flex flex-col items-center text-center hover:shadow-2xl hover:shadow-purple-500/40 transition-all active:scale-95 group">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 text-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <i className="fa-solid fa-handshake-angle"></i>
                        </div>
                        <span className="text-xs font-bold text-slate-700 leading-tight">Cadena de Favores</span>
                        <span className="text-[9px] text-slate-400 mt-1">Trueque, sumayni</span>
                    </button>

                    
                    <button onClick={() => navigate('/mapa')} className="bg-white p-3 rounded-2xl shadow-xl shadow-slate-500/30 border border-emerald-500 flex flex-col items-center text-center hover:shadow-2xl hover:shadow-emerald-500/40 transition-all active:scale-95 group">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 text-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <i className="fa-solid fa-map-location-dot"></i>
                        </div>
                        <span className="text-xs font-bold text-slate-700 leading-tight">Mapa y Recursos</span>
                        <span className="text-[9px] text-slate-400 mt-1">Botiquín, Zonas</span>
                    </button>
                </div>
            </div>

            
            <section aria-labelledby="neighborhoodNewsTitle">
                <div className="flex items-center justify-between mb-2 px-1">
                    <div className="min-w-0">
                        <h3 id="neighborhoodNewsTitle" className="text-sm font-bold text-slate-800">Noticias de tu barrio</h3>
                        <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                            <i className="fa-solid fa-location-dot text-brand-600"></i>
                            <span id="newsZoneText">Urb. Bellamar, Chimbote</span>
                        </p>
                    </div>
                    <button type="button" onClick={(event) => { filterNeighborhoodNews('all'); }} className="shrink-0 text-[11px] text-brand-700 font-semibold hover:underline">Ver todas</button>
                </div>

                <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2 mb-1 text-[11px]" aria-label="Filtrar noticias vecinales">
                    <button type="button" data-news-filter="all" aria-pressed="true" onClick={(event) => { filterNeighborhoodNews('all'); }} className="news-filter-chip shrink-0 px-3 py-1.5 rounded-full font-semibold">Todas</button>
                    <button type="button" data-news-filter="alertas" aria-pressed="false" onClick={(event) => { filterNeighborhoodNews('alertas'); }} className="news-filter-chip shrink-0 px-3 py-1.5 rounded-full font-semibold">Alertas</button>
                    <button type="button" data-news-filter="comunidad" aria-pressed="false" onClick={(event) => { filterNeighborhoodNews('comunidad'); }} className="news-filter-chip shrink-0 px-3 py-1.5 rounded-full font-semibold">Comunidad</button>
                    <button type="button" data-news-filter="servicios" aria-pressed="false" onClick={(event) => { filterNeighborhoodNews('servicios'); }} className="news-filter-chip shrink-0 px-3 py-1.5 rounded-full font-semibold">Servicios</button>
                    <button type="button" data-news-filter="seguridad" aria-pressed="false" onClick={(event) => { filterNeighborhoodNews('seguridad'); }} className="news-filter-chip shrink-0 px-3 py-1.5 rounded-full font-semibold">Seguridad</button>
                </div>

                <div id="neighborhoodNewsList" className="space-y-2">
                    <article data-news-category="alertas" className="neighborhood-news-card bg-white rounded-xl p-3 shadow-md shadow-slate-300/50 border-l-4 border-red-600 flex gap-3 items-center">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-[9px] uppercase tracking-wide font-bold text-red-700">Alerta vecinal</span>
                                <span className="text-[9px] text-slate-400">· Hace 25 min</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-800 leading-snug">Corte de agua programado en el sector 3</h4>
                            <p className="text-[10px] text-slate-600 mt-1 line-clamp-2">El servicio se interrumpirá hoy de 2:00 a 6:00 p. m. Se recomienda guardar agua.</p>
                            <p className="text-[9px] text-slate-500 mt-1.5 flex items-center gap-1">
                                <i className="fa-solid fa-location-dot text-red-600"></i> Sector 3 · Administración vecinal
                            </p>
                        </div>
                        <img src="https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=200&q=80" alt="Agua almacenada para el corte programado" className="w-[4.5rem] h-[4.5rem] rounded-lg object-cover shrink-0" />
                    </article>

                    <article data-news-category="comunidad" className="neighborhood-news-card bg-white rounded-xl p-3 shadow-md shadow-slate-300/50 border border-slate-200 flex gap-3 items-center">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-[9px] uppercase tracking-wide font-bold text-emerald-700">Comunidad</span>
                                <span className="text-[9px] text-slate-400">· Ayer</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-800 leading-snug">Vecinos convocan a faena en el parque</h4>
                            <p className="text-[10px] text-slate-600 mt-1 line-clamp-2">Este domingo se limpiarán las áreas verdes y se pintarán las bancas. Se necesitan voluntarios.</p>
                            <p className="text-[9px] text-slate-500 mt-1.5 flex items-center gap-1">
                                <i className="fa-solid fa-location-dot text-emerald-700"></i> Parque principal · Comité vecinal
                            </p>
                        </div>
                        <img src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=200&q=80" alt="Vecinos participando en una actividad comunitaria" className="w-[4.5rem] h-[4.5rem] rounded-lg object-cover shrink-0" />
                    </article>

                    <article data-news-category="servicios" className="neighborhood-news-card bg-white rounded-xl p-3 shadow-md shadow-slate-300/50 border border-slate-200 flex gap-3 items-center">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-[9px] uppercase tracking-wide font-bold text-blue-700">Servicios</span>
                                <span className="text-[9px] text-slate-400">· Hace 3 h</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-800 leading-snug">Nuevo horario de atención en la bodega de Don José</h4>
                            <p className="text-[10px] text-slate-600 mt-1 line-clamp-2">Desde hoy atenderá hasta las 10 p. m. y recibirá pedidos de abarrotes por WhatsApp.</p>
                            <p className="text-[9px] text-slate-500 mt-1.5 flex items-center gap-1">
                                <i className="fa-solid fa-location-dot text-blue-700"></i> Mz A, lote 1 · Publicado por Don José
                            </p>
                        </div>
                        <img src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=200&q=80" alt="Productos en una bodega del barrio" className="w-[4.5rem] h-[4.5rem] rounded-lg object-cover shrink-0" />
                    </article>

                    <article data-news-category="seguridad" className="neighborhood-news-card bg-white rounded-xl p-3 shadow-md shadow-slate-300/50 border border-slate-200 flex gap-3 items-center">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-[9px] uppercase tracking-wide font-bold text-amber-700">Seguridad</span>
                                <span className="text-[9px] text-slate-400">· Hace 1 h</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-800 leading-snug">Reportan luminaria apagada cerca del parque</h4>
                            <p className="text-[10px] text-slate-600 mt-1 line-clamp-2">El comité ya registró el aviso y coordina la revisión del poste. Evita la zona con poca luz.</p>
                            <p className="text-[9px] text-slate-500 mt-1.5 flex items-center gap-1">
                                <i className="fa-solid fa-location-dot text-amber-700"></i> Calle Los Pinos · Comité de seguridad
                            </p>
                        </div>
                        <img src="https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=200&q=80" alt="Luminaria en una calle del barrio" className="w-[4.5rem] h-[4.5rem] rounded-lg object-cover shrink-0" />
                    </article>
                </div>
                <p id="neighborhoodNewsEmpty" className="hidden text-center text-[11px] text-slate-500 py-4">
                    No hay noticias en esta categoría por ahora.
                </p>
            </section>

        </main>

        
        <main id="emergencyView" className="hidden flex-1 overflow-y-auto bg-slate-950 p-4 space-y-4 text-white">

            
            <div className="bg-red-700 rounded-2xl p-4 text-white shadow-xl border-2 border-red-500 text-center animate-pulse">
                <i className="fa-solid fa-triangle-exclamation text-4xl mb-2 text-yellow-300"></i>
                <h2 className="text-xl font-black uppercase tracking-wider">¡MODO EMERGENCIA ACTIVADO!</h2>
                <p className="text-xs font-medium text-red-100 mt-1">Conexión priorizada con la red vecinal y organismos de
                    socorro.</p>
            </div>

            
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">¿Cuál es tu
                    estado actual?</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={(event) => { sendEmergencyStatus('Estoy Bien'); }} className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white p-4 rounded-2xl font-bold flex flex-col items-center justify-center text-center shadow-lg border border-emerald-400">
                        <i className="fa-solid fa-circle-check text-3xl mb-1"></i>
                        <span className="text-sm">ESTOY BIEN</span>
                    </button>
                    <button onClick={(event) => { sendEmergencyStatus('Necesito Ayuda'); }} className="bg-red-600 hover:bg-red-700 active:scale-95 text-white p-4 rounded-2xl font-bold flex flex-col items-center justify-center text-center shadow-lg border border-red-400">
                        <i className="fa-solid fa-hand-holding-medical text-3xl mb-1"></i>
                        <span className="text-sm">NECESITO AYUDA</span>
                    </button>
                    <button onClick={(event) => { sendEmergencyStatus('Puedo Ayudar'); }} className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white p-4 rounded-2xl font-bold flex flex-col items-center justify-center text-center shadow-lg border border-blue-400">
                        <i className="fa-solid fa-kit-medical text-3xl mb-1"></i>
                        <span className="text-sm">PUEDO AYUDAR</span>
                    </button>
                    <button onClick={(event) => { sendEmergencyStatus('Ahí Llevándola'); }} className="bg-amber-600 hover:bg-amber-700 active:scale-95 text-white p-4 rounded-2xl font-bold flex flex-col items-center justify-center text-center shadow-lg border border-amber-400">
                        <i className="fa-solid fa-house-chimney-crack text-3xl mb-1"></i>
                        <span className="text-sm">AHÍ LLEVÁNDOLA</span>
                    </button>
                </div>
            </div>

            
            <div className="bg-slate-900 rounded-2xl p-3.5 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                    <i className="fa-solid fa-wifi-slash"></i> Herramientas Offline (Sin Internet)
                </h4>
                <div className="space-y-2">
                    <button onClick={(event) => { showToast('Ruta cargada: Punto seguro Estadio Manuel Rivera'); }} className="w-full bg-slate-800 hover:bg-slate-700 p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-semibold">
                        <span className="flex items-center gap-2">
                            <i className="fa-solid fa-person-walking-arrow-loop-left text-emerald-400 text-base"></i>
                            Punto Evacuación: Plaza/Estadio
                        </span>
                        <i className="fa-solid fa-chevron-right text-slate-500"></i>
                    </button>
                    <button onClick={(event) => { showToast('Paramédico más cercano: Dr. Perales a 150m (Mz F Lt 12)'); }} className="w-full bg-slate-800 hover:bg-slate-700 p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-semibold">
                        <span className="flex items-center gap-2">
                            <i className="fa-solid fa-user-doctor text-red-400 text-base"></i>
                            Vecinos Paramédicos Cerca (2)
                        </span>
                        <i className="fa-solid fa-chevron-right text-slate-500"></i>
                    </button>
                    <button onClick={(event) => { showToast('Abriendo directorio local sin conexión...'); }} className="w-full bg-slate-800 hover:bg-slate-700 p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-semibold">
                        <span className="flex items-center gap-2">
                            <i className="fa-solid fa-phone-volume text-blue-400 text-base"></i>
                            Directorio de Emergencias Local
                        </span>
                        <i className="fa-solid fa-chevron-right text-slate-500"></i>
                    </button>
                </div>
            </div>

            
            <div className="pt-2">
                <button onClick={(event) => { toggleEmergencyMode(false); }} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl border border-slate-700 flex items-center justify-center space-x-2 text-xs">
                    <i className="fa-solid fa-power-off"></i>
                    <span>Desactivar Modo Emergencia</span>
                </button>
            </div>

        </main>

        
        <nav id="bottomNav" aria-label="Navegación principal" className="app-bottom-nav border-t px-1 py-2 flex justify-between items-center transition-colors duration-300">
            <button className="nav-item active flex flex-1 min-w-0 flex-col items-center" aria-current="page" aria-label="Inicio">
                <i className="fa-solid fa-house text-sm"></i>
                <span className="text-[9px] font-bold mt-0.5 leading-tight">Inicio</span>
            </button>
            <button onClick={() => navigate('/servicios')} className="nav-item flex flex-1 min-w-0 flex-col items-center" aria-label="Servicios">
                <i className="fa-solid fa-wrench text-sm"></i>
                <span className="text-[9px] font-medium mt-0.5 leading-tight">Servicios</span>
            </button>
            <button onClick={(event) => { openPublishModal(); }} aria-label="Publicar" title="Publicar" className="flex flex-col items-center justify-center w-9 h-9 shrink-0 rounded-full bg-brand-600 text-white shadow-md -mt-3 hover:bg-brand-700 active:scale-95 transition-transform">
                <i className="fa-solid fa-plus text-sm"></i>
            </button>
            <button onClick={() => navigate('/favores')} className="nav-item flex flex-1 min-w-0 flex-col items-center" aria-label="Favores">
                <i className="fa-solid fa-handshake text-sm"></i>
                <span className="text-[9px] font-medium mt-0.5 leading-tight">Favores</span>
            </button>
            <button onClick={() => navigate('/mapa')} className="nav-item flex flex-1 min-w-0 flex-col items-center" aria-label="Mapa">
                <i className="fa-solid fa-map-location-dot text-sm"></i>
                <span className="text-[9px] font-medium mt-0.5 leading-tight">Mapa</span>
            </button>
        </nav>

        
        <div id="publishModal" className="hidden absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
            <div className="bg-white w-full rounded-t-3xl p-5 space-y-4 animate-in slide-in-from-bottom duration-200">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-800 text-sm">Nueva Publicación Rápida</h3>
                    <button onClick={(event) => { closePublishModal(); }} className="text-slate-400 hover:text-slate-600">
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">1. Selecciona el Tipo:</label>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <button onClick={(event) => { selectType(event.currentTarget); }} className="type-btn p-2.5 rounded-xl font-semibold flex items-center gap-2">
                                <i className="type-request-icon fa-solid fa-handshake-angle"></i> Pedir Favor
                            </button>
                            <button onClick={(event) => { selectType(event.currentTarget); }} className="type-btn p-2.5 rounded-xl font-semibold flex items-center gap-2">
                                <i className="type-offer-icon fa-solid fa-wrench"></i> Ofrecer Servicio
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">2. Descripción Corta:</label>
                        <textarea id="publishText" rows="2" placeholder="Ej: Presto escalera de 3 metros o necesito ayuda moviendo mueble..." className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"></textarea>
                    </div>

                    <button onClick={(event) => { submitPublication(); }} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl text-xs shadow-md">
                        3. Publicar en mi Barrio
                    </button>
                </div>
            </div>
        </div>

        
        <div id="zoneModal" className="hidden absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xs rounded-2xl p-4 space-y-3">
                <h3 className="font-bold text-slate-800 text-sm text-center">Selecciona tu Barrio</h3>
                <div className="space-y-2 text-xs">
                    <button onClick={(event) => { setZone('Urb. Bellamar, Chimbote'); }} className="w-full p-2.5 rounded-xl bg-purple-50 text-brand-700 font-bold border border-purple-200 text-left flex items-center justify-between">
                        <span>Urb. Bellamar</span>
                        <i className="fa-solid fa-check"></i>
                    </button>
                    <button onClick={(event) => { setZone('Urb. Buenos Aires, Nuevo Chimbote'); }} className="w-full p-2.5 rounded-xl bg-slate-50 text-slate-700 font-medium border border-slate-200 text-left hover:bg-slate-100">
                        <span>Urb. Buenos Aires</span>
                    </button>
                    <button onClick={(event) => { setZone('Casco Urbano, Chimbote'); }} className="w-full p-2.5 rounded-xl bg-slate-50 text-slate-700 font-medium border border-slate-200 text-left hover:bg-slate-100">
                        <span>Casco Urbano</span>
                    </button>
                </div>
                <button onClick={(event) => { closeZoneModal(); }} className="w-full bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs">Cerrar</button>
            </div>
        </div>

        
        <div id="toast" className="hidden absolute top-16 left-4 right-4 bg-slate-900 text-white text-xs px-3 py-2.5 rounded-xl shadow-xl z-50 flex items-center space-x-2 transition-all">
            <i className="fa-solid fa-circle-info text-amber-400 text-base"></i>
            <span id="toastText">Mensaje de notificación</span>
        </div>

    </div>
      </>
    </LegacyPage>
  );
}
