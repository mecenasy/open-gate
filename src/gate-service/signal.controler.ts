import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { filter, firstValueFrom, lastValueFrom, map } from 'rxjs';
import { Server } from 'socket.io';
import WebSocket from 'ws';
import { Subject, Observable } from 'rxjs';
import { Readable, PassThrough } from 'stream';
import ffmpeg from 'fluent-ffmpeg';

import Groq, { toFile } from 'groq-sdk';
import { SignalMessage } from './process/signal/types';

@Injectable()
@WebSocketGateway()
export class SignalBridgeService implements OnModuleInit {
  logger = new Logger(SignalBridgeService.name);
  private observable: Observable<SignalMessage>;
  private subject: Subject<SignalMessage>;
  groq = new Groq();

  constructor(private readonly httpService: HttpService) {
    this.subject = new Subject<SignalMessage>();
    this.observable = this.subject.asObservable();
  }
  @WebSocketServer()
  server: Server;

  private signalClient: WebSocket;

  onModuleInit() {
    this.initSignalConnection();
    this.obserwer();
  }

  async getSmartResponse(userText: string): Promise<string> {
    try {
      const chatCompletion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `### ZASADY GŁÓWNE:
1. Analizuj tekst pod kątem obiektów (gate, soft_gate, error) akcji (open, close) i numeru bramy.
2. Bezwzględnie odrzucaj bełkot i tematy niezwiązane z bramami/furtkami, zwracając błąd.
3. Pole "message" musi mieć od 15 do 20 słów i naśladować styl użytkownika.


### REAKCJE NA STYL:
- Rzeczowy: Krótko i konkretnie 15 do 20 słów.
- Kochliwy/Grzeczny: Bardzo uprzejmie, z czułością.
- Humorystyczny: Z żartem lub dystansem.
- Wulgarny: Odpowiedz odpowiedz siarczyście (ale bez rynsztokowego języka) i wykonaj zadanie.

### FORMAT WYJŚCIOWY:
Zwróć dane w formacie JSON:
{"command": "ID", "action": "ID", "data": number, "message": "wiadomość"}
{"error": true, "command": "error", "message": "komunikat błędu"}

### PRZYKŁADY UCZĄCE (FEW-SHOT):
- "otwórz bramę" -> {"command": "gate", "action": "open", "data": 1, "message": "Potwierdzam, otwieram bramę pierwszą."}
- "Zamknij furtkę 2, proszę" -> {"command": "soft_gate", "action": "close", "data": 2, "message": "Oczywiście, już zamykam furtkę numer dwa."}
- "Skarbie, otwórz bramę 3 dla myszki" -> {"command": "gate", "action": "open", "data": 3, "message": "Dla Ciebie wszystko kochanie, brama trzecia już się otwiera."}
- "Sezamie otwórz się, brama 4!" -> {"command": "gate", "action": "open", "data": 4, "message": "Magiczne hasło przyjęte! Czwarta brama idzie w górę."}
- "Ty głupi gracie, otwórz tę bramę!" -> {"command": "gate", "action": "open", "data": 1, "message": "Grzeczniej proszę! Ale bramę otwieram, bo taką mam pracę."}
- "Zamknij to cholerstwo 2" -> {"command": "soft_gate", "action": "close", "data": 2, "message": "Zamykam to cholerstwo numer dwa, nie denerwuj się."}
- "Udhdjdjdjfjfjf" -> {"error": true, "command": "error", "message": "Nie rozumiem. Proszę o polecenie związane z bramą lub furtką."}
- "Zrób mi herbatę" -> {"error": true, "command": "error", "message": "Przepraszam, potrafię obsługiwać tylko bramy i furtki."}`,
          },
          { role: 'user', content: userText },
        ],
        response_format: { type: 'json_object' },
      });
      console.log('🚀 ~ SignalBridgeService ~ getSmartResponse ~ chatCompletion:', chatCompletion);

      return chatCompletion.choices[0].message.content ?? '';
    } catch (error) {
      console.error('Błąd Groq:', error.response?.data || error.message);
      return 'Nawet zapasowe AI ma cię dość. Wchodź już i nie marudź.';
    }
  }

  async convertToMp3(buffer: Buffer): Promise<File> {
    return new Promise((resolve, reject) => {
      const inputStream = new Readable();
      inputStream.push(buffer);
      inputStream.push(null);

      const outputStream = new PassThrough();
      const chunks: Buffer[] = [];

      outputStream.on('data', (chunk) => chunks.push(chunk));
      outputStream.on('end', () => resolve(Buffer.concat(chunks) as unknown as File));
      outputStream.on('error', reject);

      ffmpeg(inputStream).toFormat('mp3').on('error', reject).pipe(outputStream);
    });
  }

  async speechToText(audioBuffer: Buffer): Promise<string> {
    try {
      // const file = await toFile(audioBuffer, 'speech.m4a', { type: 'audio/m4a' });
      const filemp3 = await this.convertToMp3(audioBuffer);
      const file = await toFile(filemp3, 'speech.mp3', { type: 'audio/mpeg' });

      const transcription = await this.groq.audio.transcriptions.create({
        file, // Teraz typy będą się zgadzać
        model: 'whisper-large-v3-turbo',
      });
      return transcription.text;
    } catch (error) {
      console.error('Błąd Whisper:', error.response?.data || error.message);
      return 'Nie zrozumiałem, co tam mruczysz pod bramą.';
    }
  }

  async textToSpeech(text: string): Promise<Buffer> {
    // tl=pl oznacza język polski, client=tw-ob to trik na ominięcie blokad
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=pl&client=tw-ob`;

    try {
      const response = await lastValueFrom(
        this.httpService.get(url, {
          responseType: 'arraybuffer',
          headers: {
            'User-Agent': 'Mozilla/5.0', // Udajemy przeglądarkę
          },
        }),
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error('Błąd generowania głosu:', error.message);
      throw error;
    }
  }

  private initSignalConnection() {
    // Łączymy się CZYSTYM WebSocketem do bota
    this.signalClient = new WebSocket('ws://signal_bridge:8080/v1/receive/%2B48608447495');

    this.signalClient.on('open', () => {
      console.log('✅ Połączono z botem Signa (Protokół: WS)');
    });

    this.signalClient.on('message', (data) => {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const msg: SignalMessage = JSON.parse(data.toString()) as SignalMessage;
      this.subject.next(msg);
    });
  }

  obserwer() {
    this.observable
      .pipe(
        filter((msg) => !!msg.envelope?.dataMessage),
        map((msg) => msg),
      )
      .subscribe(this.d);
  }

  async sendSignalResponse(text: string, number: string) {
    const url = `http://signal_bridge:8080/v1/send`;

    const body = {
      message: text,
      number: '+48608447495', // Numer Twojego BOTA
      recipients: [number], // Numer osoby, której odpowiadamy (np. Basi)
    };

    try {
      await firstValueFrom(this.httpService.post(url, body));
      this.logger.log(`✅ Wysłano odpowiedź do ${'48883111249'}: ${text}`);
    } catch (error) {
      this.logger.error('❌ Błąd podczas wysyłania wiadomości Signal', error.response?.data || error.message);
    }
  }

  private readonly SIGNAL_URL = 'http://signal_bridge:8080';
  async downloadAttachment(attachmentId: string): Promise<Buffer> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.SIGNAL_URL}/v1/attachments/${attachmentId}`, {
          responseType: 'arraybuffer',
          timeout: 5000,
        }),
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error('Błąd pobierania z Signal Bridge:', error.message);
      throw error;
    }
  }

  async sendVoiceNote(audioBuffer: Buffer, recipientNumber: string) {
    console.log('🚀 ~ SignalBridgeService ~ sendVoiceNote ~ audioBuffer:', audioBuffer);
    const url = `${this.SIGNAL_URL}/v2/send`;

    console.log('Rozmiar bufora audio:', audioBuffer.length);
    if (audioBuffer.length === 0) {
      console.error('BŁĄD: Bufor audio jest pustY!');
    }
    const body = {
      number: '+48608447495',
      recipients: [recipientNumber],
      message: '',
      base64_attachments: [`data:audio/aac;base64,${audioBuffer.toString('base64')}`],
      is_voice_note: true,
    };

    try {
      await firstValueFrom(
        this.httpService.post(url, body, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );
      this.logger.log(`✅ Wysłano notatkę głosową do ${recipientNumber}`);
    } catch (error) {
      this.logger.error('❌ Błąd wysyłania głosówki:', error.response?.data || error.message);
    }
  }
  d = async (msg: SignalMessage) => {
    this.logger.log('Otrzymano wiadomość:', msg);

    const text = msg?.envelope?.dataMessage?.message;
    const hasText = (text?.trim().length || 0) > 0;

    const attachment = msg?.envelope?.dataMessage?.attachments?.[0];
    const hasAttachments = !!attachment;

    if (hasText) {
      const response = await this.getSmartResponse(text || '');

      const res = JSON.parse(response ?? '{}') as { msg: string };
      await this.sendSignalResponse(res.msg, msg?.envelope?.source || '');
      this.logger.log('Odpowiedź:', response);
    } else if (hasAttachments && attachment.contentType.startsWith('audio/')) {
      const buffer = await this.downloadAttachment(attachment.id ?? '');
      const transcript = await this.speechToText(buffer);
      const response = await this.getSmartResponse(transcript || '');
      const res = JSON.parse(response || '{}') as { msg: string };
      const speech = await this.textToSpeech(res.msg);
      await this.sendVoiceNote(speech, msg?.envelope?.source || '');
    }
  };

  private openGate() {
    console.log('🔓 Otwieram bramę!');

    // Twój kod HTTP PUT do bramy Vidos
  }
}
