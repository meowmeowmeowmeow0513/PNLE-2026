
// src/utils/discordWebhook.ts

// --- CONFIGURATION ---
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    return import.meta?.env?.[key] || "";
  } catch (e) {
    return "";
  }
};

const WEBHOOK_UPDATES = getEnv('VITE_DISCORD_WEBHOOK_UPDATES');
// Use Env var if available, otherwise fallback to the provided hardcoded URL for immediate functionality
const FALLBACK_WEBHOOK_STATS = "https://discord.com/api/webhooks/1450060815326642237/19-aT9orlBaMh__kntc5OS22jHjyGG-1LU0F7fgpwyYO1t7RZXFOHQcV1vKcMlfOKA1p";
const WEBHOOK_STATS = getEnv('VITE_DISCORD_WEBHOOK_STATS') || FALLBACK_WEBHOOK_STATS;

export type DiscordChannel = 'updates' | 'stats';

/**
 * Sends a rich embed notification to a Discord channel via Webhook.
 * 
 * @param title - The title of the embed (bold)
 * @param message - The main body text
 * @param channel - 'stats' (for user achievements) or 'updates' (for system logs)
 * @param type - Determines the side-strip color of the embed
 * @param customColor - (Optional) Override the color with a decimal value
 */
export const sendDiscordNotification = async (
  title: string, 
  message: string, 
  channel: DiscordChannel = 'stats',
  type: 'info' | 'alert' | 'success' | 'milestone' = 'info',
  customColor?: number 
) => {
  const url = channel === 'updates' ? WEBHOOK_UPDATES : WEBHOOK_STATS;

  if (!url) {
      console.warn(`[Discord Webhook] No URL found for '${channel}'. Notification suppressed.`);
      return;
  }

  // Default Colors (Decimal format for Discord API)
  let color = 14362487; // Pink default (info)
  if (type === 'alert') color = 15158332; // Red
  if (type === 'success') color = 3066993; // Green
  if (type === 'milestone') color = 15844367; // Gold

  if (customColor) {
      color = customColor;
  }

  const payload = {
    username: "Crescere Bot", 
    avatar_url: "https://firebasestorage.googleapis.com/v0/b/pnle-review-companion.firebasestorage.app/o/WebsiteLogo.png?alt=media&token=618c2ca2-f87c-4daf-9b2b-0342976a7567",
    embeds: [
      {
        title: title,
        description: message,
        color: color,
        footer: {
          text: "PNLE Review Companion App • Batch 2026"
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error("Failed to send Discord webhook", error);
  }
};
