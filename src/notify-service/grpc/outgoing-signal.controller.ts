import { Controller, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { isAxiosError } from 'axios';
import {
  DownloadAttachmentRequest,
  DownloadAttachmentResponse,
  OutgoingSignalRequest,
  OutgoingSignalServiceController,
  OutgoingSignalServiceControllerMethods,
  SignalAck,
  SignalMessageType,
} from 'src/proto/signal';

@Controller()
@OutgoingSignalServiceControllerMethods()
export class OutgoingSignalController implements OutgoingSignalServiceController {
  private readonly logger = new Logger(OutgoingSignalController.name);
  private readonly baseUrl = process.env.SIGNAL_API_URL ?? 'http://signal_bridge:8080';
  private readonly botNumber = process.env.SIGNAL_ACCOUNT ?? '+48608447495';

  constructor(private readonly httpService: HttpService) {}

  async sendMessage(request: OutgoingSignalRequest): Promise<SignalAck> {
    const { source, message, type } = request;

    try {
      if (type === SignalMessageType.AUDIO) {
        await this.sendAudio(source, Buffer.from(message));
      } else {
        await this.sendText(source, Buffer.from(message).toString('utf-8'));
      }

      this.logger.log(`✅ Signal message sent to ${source}`);
      return { success: true, message: 'Message sent' };
    } catch (error) {
      const detail = isAxiosError(error) ? JSON.stringify(error.response?.data ?? error.message) : String(error);
      this.logger.error(`❌ Failed to send Signal message to ${source}: ${detail}`);
      return { success: false, message: detail };
    }
  }

  async downloadAttachment(request: DownloadAttachmentRequest): Promise<DownloadAttachmentResponse> {
    const { attachmentId } = request;

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<Buffer>(`${this.baseUrl}/v1/attachments/${attachmentId}`, {
          responseType: 'arraybuffer',
          timeout: 5000,
        }),
      );

      this.logger.log(`✅ Attachment ${attachmentId} downloaded`);
      return { success: true, data: new Uint8Array(data), error: '' };
    } catch (error) {
      const detail = isAxiosError(error) ? JSON.stringify(error.response?.data ?? error.message) : String(error);
      this.logger.error(`❌ Failed to download attachment ${attachmentId}: ${detail}`);
      return { success: false, data: new Uint8Array(), error: detail };
    }
  }

  private async sendText(phone: string, text: string): Promise<void> {
    await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/v1/send`, {
        message: text,
        number: this.botNumber,
        recipients: [phone],
      }),
    );
  }

  private async sendAudio(phone: string, audioFile: Buffer): Promise<void> {
    await firstValueFrom(
      this.httpService.post(
        `${this.baseUrl}/v2/send`,
        {
          number: this.botNumber,
          recipients: [phone],
          message: '',
          base64_attachments: [`data:audio/aac;base64,${audioFile.toString('base64')}`],
          is_voice_note: true,
        },
        { headers: { 'Content-Type': 'application/json' } },
      ),
    );
  }
}
