import LegacyPage from '../components/LegacyPage.jsx';
import { useNavigate } from 'react-router-dom';
import { speakText } from '../utils/speech.js';
import { useEffect } from 'react';

const SCRIPTS = ["/legacy/favores.js"];

export default function Favores() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleSpeechStatus = (event) => {
      const toast = document.getElementById('toast');
      const toastText = document.getElementById('toastText');
      if (!toast || !toastText) return;
      toastText.textContent = event.detail === 'playing'
        ? 'Reproduciendo lectura en voz alta...'
        : 'Lectura en voz alta lista.';
      toast.classList.remove('hidden');
      window.setTimeout(() => toast.classList.add('hidden'), 2500);
    };
    window.addEventListener('speech-status', handleSpeechStatus);
    return () => window.removeEventListener('speech-status', handleSpeechStatus);
  }, []);

  return (
    <LegacyPage page="favores" scripts={SCRIPTS}>
      <>
<div id="mobileFrame" className="w-full sm:max-w-sm h-screen sm:h-[844px] bg-white sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative border-0 sm:border-[8px] border-slate-800">
        
        
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

        
        <section className="bg-white px-4 pt-3 pb-3 border-b border-slate-200 shrink-0" aria-label="Buscar y filtrar favores">
            <div className="mb-2.5">
                <h2 className="font-display font-bold text-base text-slate-900">Favores del barrio</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Apoyos, préstamos y actividades vecinales.</p>
                <p id="favorResultsCount" className="text-[10px] text-slate-400 mt-1" aria-live="polite"></p>
            </div>

            <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-400 text-sm"></i>
                <input type="search" id="favorSearchInput" onInput={(event) => { filterFavors(); }} aria-label="Buscar favores" placeholder="¿Qué apoyo necesitas?" className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <button onClick={(event) => { clearFavorSearch(); }} aria-label="Limpiar búsqueda" className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 p-1">
                    <i className="fa-solid fa-xmark text-sm"></i>
                </button>
            </div>

            <div className="favor-filter-scroll flex gap-2 text-xs font-medium mt-2.5" role="group" aria-label="Categorías de favores" tabIndex="0">
                <button type="button" data-category="all" onClick={(event) => { filterFavors('all'); }} aria-pressed="true" className="favor-filter-chip shrink-0 bg-slate-900 text-white px-3 py-1.5 rounded-full">Todos</button>
                <button type="button" data-category="Herramientas" onClick={(event) => { filterFavors('Herramientas'); }} aria-pressed="false" className="favor-filter-chip shrink-0 bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50">Herramientas</button>
                <button type="button" data-category="Trueque" onClick={(event) => { filterFavors('Trueque'); }} aria-pressed="false" className="favor-filter-chip shrink-0 bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50">Trueque</button>
                <button type="button" data-category="Materiales" onClick={(event) => { filterFavors('Materiales'); }} aria-pressed="false" className="favor-filter-chip shrink-0 bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50">Materiales</button>
                <button type="button" data-category="Faena" onClick={(event) => { filterFavors('Faena'); }} aria-pressed="false" className="favor-filter-chip shrink-0 bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50">Faenas</button>
                <button type="button" data-category="Movilidad" onClick={(event) => { filterFavors('Movilidad'); }} aria-pressed="false" className="favor-filter-chip shrink-0 bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50">Movilidad</button>
            </div>
        </section>

        
        <main id="normalView" className="flex-1 overflow-y-auto bg-slate-50 p-3 space-y-4">

            
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-3 text-white shadow-md">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 text-amber-200">
                        <i className="fa-solid fa-vault text-yellow-300"></i> Banco de Recursos del Barrio
                    </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                    <div onClick={(event) => { showResourceDetails('Generador Eléctrico 5KW', 'Don Pedro - Mz C Lt 4'); }} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-1.5 rounded-xl border border-white/20 cursor-pointer transition-all">
                        <i className="fa-solid fa-bolt text-yellow-300 text-sm mb-1 block"></i>
                        <span className="font-bold truncate block">Generador</span>
                    </div>
                    <div onClick={(event) => { showResourceDetails('Camioneta 4x4 de Carga', 'Carlos M. - Mz K Lt 10'); }} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-1.5 rounded-xl border border-white/20 cursor-pointer transition-all">
                        <i className="fa-solid fa-truck-pickup text-white text-sm mb-1 block"></i>
                        <span className="font-bold truncate block">Camioneta</span>
                    </div>
                    <div onClick={(event) => { showResourceDetails('Botiquín Completo de Primeros Auxilios', 'Sra. Rosa - Mz F Lt 2'); }} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-1.5 rounded-xl border border-white/20 cursor-pointer transition-all">
                        <i className="fa-solid fa-kit-medical text-red-300 text-sm mb-1 block"></i>
                        <span className="font-bold truncate block">Botiquín</span>
                    </div>
                    <div onClick={(event) => { showResourceDetails('Tanque de Agua 1000L Movible', 'Comité Vecinal'); }} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-1.5 rounded-xl border border-white/20 cursor-pointer transition-all">
                        <i className="fa-solid fa-faucet-drip text-blue-200 text-sm mb-1 block"></i>
                        <span className="font-bold truncate block">Agua</span>
                    </div>
                </div>
            </div>

            
            <div id="favorsGrid" className="grid grid-cols-1 gap-3">

                
                <div className="favor-card category-Herramientas bg-white rounded-xl border border-slate-200 border-l-4 border-l-orange-600 overflow-hidden shadow-lg shadow-slate-300/50 flex hover:shadow-xl hover:shadow-slate-400/50 transition-shadow">
                    <div className="relative w-28 shrink-0">
                        <img src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80" alt="Taladro Roto" className="w-full h-full min-h-[148px] object-cover" />
                        <span className="absolute top-1.5 left-1.5 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                            DISPONIBLE
                        </span>
                        <button onClick={(event) => { speakText('Préstamo de Taladro Percutor. Ofrecido por Don Manuel.'); }} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 text-xs">
                            <i className="fa-solid fa-volume-high"></i>
                        </button>
                    </div>
                    <div className="p-3 flex-1 min-w-0 flex flex-col justify-between space-y-3">
                        <div>
                            <span className="text-[9px] font-bold text-orange-600 block uppercase">Herramientas</span>
                            <h3 className="text-xs font-bold text-slate-800 leading-tight">Presto Taladro Percutor</h3>
                            <p className="text-[10px] text-slate-600 mt-1 line-clamp-2">Incluye brocas para concreto. Solo presentar DNI vecinal.</p>
                        </div>
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-[9px] text-slate-500 font-medium truncate">Por: Manuel R.</span>
                            <button onClick={(event) => { requestFavor('Taladro Percutor'); }} className="bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition-colors">
                                Pedir
                            </button>
                        </div>
                    </div>
                </div>

                
                <div className="favor-card category-Materiales bg-white rounded-xl border border-slate-200 border-l-4 border-l-orange-600 overflow-hidden shadow-lg shadow-slate-300/50 flex hover:shadow-xl hover:shadow-slate-400/50 transition-shadow">
                    <div className="relative w-28 shrink-0">
                        <img src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=300&q=80" alt="Ladrillos sobrantes" className="w-full h-full min-h-[148px] object-cover" />
                        <span className="absolute top-1.5 left-1.5 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                            DISPONIBLE
                        </span>
                        <button onClick={(event) => { speakText('Donación de 30 Ladrillos de techo. Ofrecido por Lucía.'); }} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 text-xs">
                            <i className="fa-solid fa-volume-high"></i>
                        </button>
                    </div>
                    <div className="p-3 flex-1 min-w-0 flex flex-col justify-between space-y-3">
                        <div>
                            <span className="text-[9px] font-bold text-blue-600 block uppercase">Donación</span>
                            <h3 className="text-xs font-bold text-slate-800 leading-tight">30 Ladrillos de Techo</h3>
                            <p className="text-[10px] text-slate-600 mt-1 line-clamp-2">Sobró de mi remodelación. Para quien lo necesite urgente.</p>
                        </div>
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-[9px] text-slate-500 font-medium truncate">Por: Lucía M.</span>
                            <button onClick={(event) => { requestFavor('30 Ladrillos de Techo'); }} className="bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition-colors">
                                Pedir
                            </button>
                        </div>
                    </div>
                </div>

                
                <div className="favor-card category-Faena bg-white rounded-xl border border-slate-200 border-l-4 border-l-orange-600 overflow-hidden shadow-lg shadow-slate-300/50 flex hover:shadow-xl hover:shadow-slate-400/50 transition-shadow">
                    <div className="relative w-28 shrink-0">
                        <img src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=300&q=80" alt="Limpieza de parque" className="w-full h-full min-h-[148px] object-cover" />
                        <span className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                            EN PROCESO
                        </span>
                        <button onClick={(event) => { speakText('Faena de Limpieza del Parque Los Pinos este sábado.'); }} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 text-xs">
                            <i className="fa-solid fa-volume-high"></i>
                        </button>
                    </div>
                    <div className="p-3 flex-1 min-w-0 flex flex-col justify-between space-y-3">
                        <div>
                            <span className="text-[9px] font-bold text-emerald-600 block uppercase">Faena Comunitaria</span>
                            <h3 className="text-xs font-bold text-slate-800 leading-tight">Limpieza Parque Pinos</h3>
                            <p className="text-[10px] text-slate-600 mt-1 line-clamp-2">Se buscan 4 voluntarios para pintar bancas y despejar maleza.</p>
                        </div>
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-[9px] text-slate-500 font-medium truncate">5 unidos</span>
                            <button onClick={(event) => { requestFavor('Faena Parque Pinos'); }} className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition-colors">
                                Unirse
                            </button>
                        </div>
                    </div>
                </div>

                
                <div className="favor-card category-Trueque bg-white rounded-xl border border-slate-200 border-l-4 border-l-orange-600 overflow-hidden shadow-lg shadow-slate-300/50 flex hover:shadow-xl hover:shadow-slate-400/50 transition-shadow">
                    <div className="relative w-28 shrink-0">
                        <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=300&q=80" alt="Clases matemáticas" className="w-full h-full min-h-[148px] object-cover" />
                        <span className="absolute top-1.5 left-1.5 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                            DISPONIBLE
                        </span>
                        <button onClick={(event) => { speakText('Trueque: Enseño matemáticas por apoyo en costura.'); }} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 text-xs">
                            <i className="fa-solid fa-volume-high"></i>
                        </button>
                    </div>
                    <div className="p-3 flex-1 min-w-0 flex flex-col justify-between space-y-3">
                        <div>
                            <span className="text-[9px] font-bold text-purple-600 block uppercase">Trueque sumayni</span>
                            <h3 className="text-xs font-bold text-slate-800 leading-tight">Clases Mates x Costura</h3>
                            <p className="text-[10px] text-slate-600 mt-1 line-clamp-2">Refuerzo primaria a cambio de ayuda ajustando un vestido.</p>
                        </div>
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-[9px] text-slate-500 font-medium truncate">Por: Profesora Ana</span>
                            <button onClick={(event) => { requestFavor('Trueque Matemáticas'); }} className="bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition-colors">
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>

                
                <div className="favor-card category-Movilidad bg-white rounded-xl border border-slate-200 border-l-4 border-l-orange-600 overflow-hidden shadow-lg shadow-slate-300/50 flex hover:shadow-xl hover:shadow-slate-400/50 transition-shadow">
                    <div className="relative w-28 shrink-0">
                        <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=300&q=80" alt="Auto en ruta" className="w-full h-full min-h-[148px] object-cover" />
                        <span className="absolute top-1.5 left-1.5 bg-slate-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                            RESUELTO
                        </span>
                        <button onClick={(event) => { speakText('Movilidad Solidaria al Hospital Essalud resuelta por Jorge.'); }} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 text-xs">
                            <i className="fa-solid fa-volume-high"></i>
                        </button>
                    </div>
                    <div className="p-3 flex-1 min-w-0 flex flex-col justify-between space-y-3 opacity-80">
                        <div>
                            <span className="text-[9px] font-bold text-slate-500 block uppercase">Movilidad</span>
                            <h3 className="text-xs font-bold text-slate-800 leading-tight">Traslado a Essalud</h3>
                            <p className="text-[10px] text-slate-600 mt-1 line-clamp-2">Llevar a abuelita a cita médica de las 8:00 AM.</p>
                        </div>
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-[9px] text-slate-500 font-medium truncate">Ayudó: Jorge V.</span>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded">
                                Completo
                            </span>
                        </div>
                    </div>
                </div>

                
                <div className="favor-card category-Herramientas bg-white rounded-xl border border-slate-200 border-l-4 border-l-orange-600 overflow-hidden shadow-lg shadow-slate-300/50 flex hover:shadow-xl hover:shadow-slate-400/50 transition-shadow">
                    <div className="relative w-28 shrink-0">
                        <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80" alt="Escalera de aluminio" className="w-full h-full min-h-[148px] object-cover" />
                        <span className="absolute top-1.5 left-1.5 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                            DISPONIBLE
                        </span>
                        <button onClick={(event) => { speakText('Préstamo de Escalera de 3 cuerpos. Ofrecido por Don Beto.'); }} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 text-xs">
                            <i className="fa-solid fa-volume-high"></i>
                        </button>
                    </div>
                    <div className="p-3 flex-1 min-w-0 flex flex-col justify-between space-y-3">
                        <div>
                            <span className="text-[9px] font-bold text-orange-600 block uppercase">Herramientas</span>
                            <h3 className="text-xs font-bold text-slate-800 leading-tight">Escalera de Aluminio</h3>
                            <p className="text-[10px] text-slate-600 mt-1 line-clamp-2">Escalera alta de 3 metros para trabajos en techo.</p>
                        </div>
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-[9px] text-slate-500 font-medium truncate">Por: Roberto T.</span>
                            <button onClick={(event) => { requestFavor('Escalera de Aluminio'); }} className="bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition-colors">
                                Pedir
                            </button>
                        </div>
                    </div>
                </div>

            </div>
            <div id="favorEmptyState" className="hidden text-center py-8 bg-white rounded-xl border border-dashed border-slate-300">
                <i className="fa-solid fa-magnifying-glass text-2xl text-slate-300 mb-2"></i>
                <p className="text-xs font-semibold text-slate-600">No se encontraron favores</p>
                <p className="text-[10px] text-slate-400">Prueba con otra búsqueda o categoría.</p>
            </div>

        </main>

        
        <main id="emergencyView" className="hidden flex-1 overflow-y-auto bg-slate-950 p-4 space-y-4 text-white">
            <div className="bg-red-700 rounded-2xl p-4 text-white shadow-xl border-2 border-red-500 text-center animate-pulse">
                <i className="fa-solid fa-triangle-exclamation text-4xl mb-2 text-yellow-300"></i>
                <h2 className="text-xl font-black uppercase tracking-wider">¡EMERGENCIA SOLIDARIA!</h2>
                <p className="text-xs font-medium text-red-100 mt-1">Cadena de ayuda activada para apoyo en el barrio.</p>
            </div>

            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">Respuesta Rápida Vecinal</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={(event) => { sendEmergencyStatus('Tengo Botiquín'); }} className="bg-emerald-600 hover:bg-emerald-700 p-3 rounded-2xl font-bold flex flex-col items-center justify-center text-center text-xs">
                        <i className="fa-solid fa-kit-medical text-2xl mb-1"></i>
                        <span>TENGO BOTIQUÍN</span>
                    </button>
                    <button onClick={(event) => { sendEmergencyStatus('Ofrezco Movilidad'); }} className="bg-blue-600 hover:bg-blue-700 p-3 rounded-2xl font-bold flex flex-col items-center justify-center text-center text-xs">
                        <i className="fa-solid fa-truck-pickup text-2xl mb-1"></i>
                        <span>OFREZCO CAMIONETA</span>
                    </button>
                    <button onClick={(event) => { sendEmergencyStatus('Punto de Encuentro'); }} className="bg-purple-600 hover:bg-purple-700 p-3 rounded-2xl font-bold flex flex-col items-center justify-center text-center text-xs">
                        <i className="fa-solid fa-people-roof text-2xl mb-1"></i>
                        <span>ABRIR REFUGIO</span>
                    </button>
                    <button onClick={(event) => { sendEmergencyStatus('Necesito Rescate'); }} className="bg-red-600 hover:bg-red-700 p-3 rounded-2xl font-bold flex flex-col items-center justify-center text-center text-xs">
                        <i className="fa-solid fa-hand-holding-medical text-2xl mb-1"></i>
                        <span>NECESITO AYUDA</span>
                    </button>
                </div>
            </div>

            <button onClick={(event) => { toggleEmergencyMode(false); }} className="w-full bg-slate-800 text-slate-300 font-bold py-3 rounded-xl border border-slate-700 text-xs">
                Desactivar Modo Emergencia
            </button>
        </main>

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

        
        <nav id="bottomNav" aria-label="Navegación principal" className="app-bottom-nav bg-white border-t border-slate-200 px-1 py-2 flex justify-between items-center text-slate-500 transition-colors duration-300">
            <button onClick={() => navigate('/sumayni')} className="nav-item flex flex-1 min-w-0 flex-col items-center hover:text-brand-600" aria-label="Inicio">
                <i className="fa-solid fa-house text-sm"></i>
                <span className="text-[9px] font-medium mt-0.5 leading-tight">Inicio</span>
            </button>
            <button onClick={() => navigate('/servicios')} className="nav-item flex flex-1 min-w-0 flex-col items-center hover:text-brand-600" aria-label="Servicios">
                <i className="fa-solid fa-wrench text-sm"></i>
                <span className="text-[9px] font-medium mt-0.5 leading-tight">Servicios</span>
            </button>
            <button onClick={(event) => { openPublishFavorModal(); }} aria-label="Publicar favor" title="Publicar favor" className="flex flex-col items-center justify-center w-9 h-9 shrink-0 rounded-full bg-brand-600 text-white shadow-md -mt-3 hover:bg-brand-700 active:scale-95 transition-transform">
                <i className="fa-solid fa-plus text-sm"></i>
            </button>
            <button className="nav-item active flex flex-1 min-w-0 flex-col items-center text-brand-600" aria-current="page" aria-label="Favores">
                <i className="fa-solid fa-handshake text-sm"></i>
                <span className="text-[9px] font-bold mt-0.5 leading-tight">Favores</span>
            </button>
            <button onClick={() => navigate('/mapa')} className="nav-item flex flex-1 min-w-0 flex-col items-center hover:text-brand-600" aria-label="Mapa">
                <i className="fa-solid fa-map-location-dot text-sm"></i>
                <span className="text-[9px] font-medium mt-0.5 leading-tight">Mapa</span>
            </button>
        </nav>

        
        <div id="publishFavorModal" className="hidden absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
            <div className="bg-white w-full rounded-t-3xl p-5 space-y-4 animate-in slide-in-from-bottom duration-200">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 className="font-bold text-slate-800 text-sm">Publicar Favor o Apoyo (Sin dinero)</h3>
                    <button onClick={(event) => { closePublishFavorModal(); }} className="text-slate-400 hover:text-slate-600">
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>
                
                <div className="space-y-3">
                    <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">1. Categoría:</label>
                        <select id="favorCategorySelect" className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:ring-2 focus:ring-orange-500">
                            <option value="Herramientas">Préstamo de Herramienta</option>
                            <option value="Materiales">Donación de Materiales</option>
                            <option value="Trueque">Trueque de Habilidades</option>
                            <option value="Faena">Ayuda en Faena Vecinal</option>
                            <option value="Movilidad">Movilidad Solidaria</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">2. Detalle del favor:</label>
                        <input id="favorTitleInput" type="text" placeholder="Ej: Presto podadora de césped..." className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                    </div>

                    <button onClick={(event) => { submitNewFavor(); }} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl text-xs shadow-md">
                        3. Publicar en el Muro
                    </button>
                </div>
            </div>
        </div>

        
        <div id="resourceModal" className="hidden absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xs rounded-2xl p-4 space-y-3 text-center">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto text-xl">
                    <i className="fa-solid fa-boxes-stacked"></i>
                </div>
                <h3 id="resourceTitle" className="font-bold text-slate-800 text-sm">Recurso Comunitario</h3>
                <p id="resourceOwner" className="text-xs text-slate-500">Ubicación / Responsable</p>
                <div className="pt-2 flex gap-2">
                    <button onClick={(event) => { closeResourceModal(); }} className="w-1/2 bg-slate-100 text-slate-700 font-bold py-2 rounded-xl text-xs">Cerrar</button>
                    <a id="resourceWhatsappBtn" href="https://wa.me/" target="_blank" className="w-1/2 bg-emerald-600 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1">
                        <i className="fa-brands fa-whatsapp"></i> Solicitar
                    </a>
                </div>
            </div>
        </div>

        
        <div id="toast" className="hidden absolute top-16 left-4 right-4 bg-slate-900 text-white text-xs px-3 py-2.5 rounded-xl shadow-xl z-50 flex items-center space-x-2 transition-all">
            <i className="fa-solid fa-circle-info text-amber-400 text-base"></i>
            <span id="toastText">Mensaje</span>
        </div>

    </div>
      </>
    </LegacyPage>
  );
}
