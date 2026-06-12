// Speaks a Yorùbá phrase with the Web Speech API, preferring a Yorùbá voice
// when the platform ships one and falling back to the default voice at a
// slower rate so tone patterns stay audible.
export function speakYoruba(text: string): void {
  if (!text || typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const yorubaVoice = voices.find((v) => /^yo/i.test(v.lang));
    if (yorubaVoice) utterance.voice = yorubaVoice;
    utterance.lang = yorubaVoice ? yorubaVoice.lang : "yo-NG";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Speech unsupported: the button simply does nothing.
  }
}
