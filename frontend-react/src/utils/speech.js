export function speakText(text) {
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
    console.warn('La lectura en voz alta no está disponible en este navegador.');
    return false;
  }

  const synth = window.speechSynthesis;
  synth.cancel();

  const utterance = new window.SpeechSynthesisUtterance(text);
  const voices = synth.getVoices();
  const spanishVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith('es'));
  utterance.voice = spanishVoice;
  utterance.lang = spanishVoice?.lang || 'es-ES';
  utterance.rate = 0.95;
  utterance.volume = 1;
  utterance.onerror = (event) => {
    console.error('No se pudo reproducir la lectura en voz alta.', event.error);
  };
  utterance.onstart = () => {
    window.dispatchEvent(new CustomEvent('speech-status', { detail: 'playing' }));
  };
  utterance.onend = () => {
    window.dispatchEvent(new CustomEvent('speech-status', { detail: 'ended' }));
  };
  synth.speak(utterance);
  synth.resume();
  window.dispatchEvent(new CustomEvent('speech-status', { detail: 'queued' }));
  return true;
}
