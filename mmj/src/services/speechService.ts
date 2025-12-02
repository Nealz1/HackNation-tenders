import { API_BASE_URL } from '../config/constants';

export class SpeechService {
  static async transcribe(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');

    const response = await fetch(`${API_BASE_URL}/api/speech/transcribe`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to transcribe audio');
    }

    const data = await response.json();
    return data.text;
  }

  static async synthesize(text: string, voice: string = 'alloy'): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/speech/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, voice }),
    });

    if (!response.ok) {
      throw new Error('Failed to synthesize speech');
    }

    return await response.blob();
  }

  static playAudio(audioBlob: Blob): HTMLAudioElement {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
    audio.onended = () => URL.revokeObjectURL(audioUrl);
    return audio;
  }
}

