import { Module } from '@nestjs/common';
import { TranscriptionProcessor } from './transcription.processor';
import { SpeechProcessor } from './speech.processor';
import { HttpModule } from '@nestjs/axios';
import { GoogleService } from '../services/google.service';
import { GroqService } from '../services/groq.service';

@Module({
  imports: [HttpModule],
  providers: [TranscriptionProcessor, SpeechProcessor, GroqService, GoogleService],
})
export class AudioModule {}
