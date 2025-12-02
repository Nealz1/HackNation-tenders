import { SpeechService } from '../services/speechService';

let currentAudio: HTMLAudioElement | null = null;
let isLoading = false;
let currentMessageId: string | null = null;

const voiceMap: Record<string, string> = {
  'pl-PL': 'alloy',
  'en-US': 'alloy',
};

export const speak = async (text: string, language: 'pl' | 'en' = 'pl', messageId?: string) => {
  const messageIdentifier = messageId || text.substring(0, 50);

  if (isLoading) {
    console.log('TTS already loading, ignoring request');
    return;
  }

  if (currentAudio) {
    if (currentMessageId === messageIdentifier) {
      currentAudio.pause();
      currentAudio = null;
      currentMessageId = null;
      return;
    }
    currentAudio.pause();
    currentAudio = null;
  }

  try {
    isLoading = true;
    currentMessageId = messageIdentifier;

    const lang = language === 'pl' ? 'pl-PL' : 'en-US';
    const voice = voiceMap[lang];

    const audioBlob = await SpeechService.synthesize(text, voice);

    if (currentMessageId !== messageIdentifier) {
      isLoading = false;
      return;
    }

    currentAudio = SpeechService.playAudio(audioBlob);
    isLoading = false;

    currentAudio.onended = () => {
      currentAudio = null;
      currentMessageId = null;
    };

    currentAudio.onerror = () => {
      currentAudio = null;
      currentMessageId = null;
      isLoading = false;
    };
  } catch (error) {
    isLoading = false;
    currentMessageId = null;
    console.error('Text-to-speech error:', error);
    console.warn('Falling back to browser TTS');

    if (!window.speechSynthesis) {
      console.warn('Text-to-speech is not supported by this browser');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'pl' ? 'pl-PL' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }
};

export const stopSpeech = () => {
  isLoading = false;
  currentMessageId = null;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

export const isSpeechSupported = () => {
  return true;
};

export const isSpeaking = () => {
  return currentAudio !== null || isLoading;
};


