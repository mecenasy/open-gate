import { Controller, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { isAxiosError } from 'axios';
import {
  ContactBindingNotifyServiceController,
  ContactBindingNotifyServiceControllerMethods,
  SendBindingInviteRequest,
  SendBindingInviteResponse,
} from 'src/proto/contact-binding';
import { BindingPlatform, ContactBindingSendStatus } from '@app/entities';
import { PlatformConfigService } from '../platform-config/platform-config.service';
import { buildBindingInviteText } from './invite-text.builder';

/**
 * gRPC entry point for sending the binding invite to a recipient. The
 * outbound timestamp returned by signal-cli /v2/send becomes the binding's
 * outbound_message_id — the incoming detector matches it against
 * dataMessage.quote.id when the recipient hits "Reply" (the primary
 * verification path; regex fallback covers users who copy the token text
 * instead of using Reply).
 *
 * Issues its own HTTP call rather than going through SignalSender — see
 * MEMORY: project_signal_send_unify.md. Once the send-method unification
 * lands this controller will collapse to a single shared sender.
 */
@Controller()
@ContactBindingNotifyServiceControllerMethods()
export class ContactBindingInviteController implements ContactBindingNotifyServiceController {
  private readonly logger = new Logger(ContactBindingInviteController.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly platformConfigService: PlatformConfigService,
  ) {}

  async sendBindingInvite(req: SendBindingInviteRequest): Promise<SendBindingInviteResponse> {
    if (req.platform !== BindingPlatform.Signal) {
      // MVP supports Signal only; WhatsApp/Messenger have separate
      // delivery semantics and will plug in via their own controllers.
      return {
        status: false,
        message: `Platform "${req.platform}" not yet supported`,
        outboundMessageId: '',
        sendStatus: ContactBindingSendStatus.Failed,
      };
    }

    const config = await this.platformConfigService.getConfig(req.tenantId, 'signal');
    if (!config) {
      this.logger.warn(`No Signal config for tenant ${req.tenantId} — cannot send binding invite ${req.bindingId}`);
      return {
        status: false,
        message: 'No Signal config for tenant',
        outboundMessageId: '',
        sendStatus: ContactBindingSendStatus.Failed,
      };
    }

    const text = buildBindingInviteText({ tenantName: req.tenantName, token: req.token });

    try {
      const response = await firstValueFrom(
        this.httpService.post<{ timestamp: number }>(`${config.apiUrl}/v2/send`, {
          message: text,
          number: config.account,
          recipients: [req.phoneE164],
        }),
      );
      const timestamp = response.data?.timestamp;
      if (typeof timestamp !== 'number') {
        return {
          status: false,
          message: 'signal-cli response missing timestamp',
          outboundMessageId: '',
          sendStatus: ContactBindingSendStatus.Failed,
        };
      }
      this.logger.log(`Binding invite ${req.bindingId} sent to ${req.phoneE164}, timestamp=${timestamp}`);
      return {
        status: true,
        message: 'OK',
        outboundMessageId: String(timestamp),
        sendStatus: ContactBindingSendStatus.Sent,
      };
    } catch (error) {
      const detail = formatError(error);
      const isUnregistered = isAxiosError(error) && error.response?.status === 400 && /not.*regist/i.test(detail);
      const sendStatus = isUnregistered ? ContactBindingSendStatus.NotOnPlatform : ContactBindingSendStatus.Failed;
      this.logger.warn(`Binding invite ${req.bindingId} → ${req.phoneE164} ${sendStatus}: ${detail}`);
      return {
        status: false,
        message: detail,
        outboundMessageId: '',
        sendStatus,
      };
    }
  }
}

function formatError(error: unknown): string {
  if (isAxiosError(error)) {
    return JSON.stringify(error.response?.data ?? error.message).slice(0, 500);
  }
  return String(error).slice(0, 500);
}
