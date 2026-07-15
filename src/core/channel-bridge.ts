import { OpenFangClient } from './openfang-client';

const WELL_KNOWN_ADAPTERS: Record<string, string> = {
  telegram: 'Telegram Bot API',
  discord: 'Discord Bot',
  slack: 'Slack App',
  whatsapp: 'WhatsApp Cloud/Web',
  signal: 'Signal Messenger',
  matrix: 'Matrix Protocol',
  email: 'IMAP/SMTP',
  teams: 'Microsoft Teams',
  mattermost: 'Mattermost',
  googlechat: 'Google Chat',
  feishu: 'Feishu/Lark',
  messenger: 'Facebook Messenger',
  mastodon: 'Mastodon',
  bluesky: 'Bluesky AT Protocol',
  reddit: 'Reddit Bot',
  linkedin: 'LinkedIn Bot',
  irc: 'IRC',
  xmpp: 'XMPP/Jabber',
  nostr: 'Nostr Protocol',
  webhook: 'Generic Webhook',
};

export class ChannelBridge {
  private client: OpenFangClient;
  private activeAdapters: string[];

  constructor(client: OpenFangClient, adapters?: string[]) {
    this.client = client;
    this.activeAdapters = adapters || Object.keys(WELL_KNOWN_ADAPTERS);
  }

  get availableAdapters(): string[] {
    return Object.keys(WELL_KNOWN_ADAPTERS);
  }

  get adapterDescriptions(): Record<string, string> {
    return { ...WELL_KNOWN_ADAPTERS };
  }

  async send(channel: string, message: string): Promise<{ ok: boolean; error?: string }> {
    if (!this.activeAdapters.includes(channel) && this.activeAdapters.length > 0) {
      return { ok: false, error: `Channel '${channel}' not in active adapters` };
    }
    const res = await this.client.sendToChannel(channel, message);
    return res.ok ? { ok: true } : { ok: false, error: res.error };
  }

  async broadcast(message: string, channels?: string[]): Promise<Record<string, { ok: boolean; error?: string }>> {
    const targets = channels || this.activeAdapters;
    const results: Record<string, { ok: boolean; error?: string }> = {};
    for (const ch of targets) {
      results[ch] = await this.send(ch, message);
    }
    return results;
  }
}
