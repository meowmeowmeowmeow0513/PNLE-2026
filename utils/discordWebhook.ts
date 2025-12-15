
// src/utils/discordWebhook.ts

// --- CONFIGURATION ---
// Safely access environment variables to prevent White Screen of Death in previewers
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    return import.meta?.env?.[key] || "";
  } catch (e) {
    return "";
  }
};

const WEBHOOK_UPDATES = getEnv('VITE_DISCORD_WEBHOOK_UPDATES');
const WEBHOOK_STATS = getEnv('VITE_DISCORD_WEBHOOK_STATS');

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

  // Mock Success if no URL is configured (Dev/Preview Mode)
  if (!url) {
      console.warn(`[Discord Mock] URL not set for '${channel}'. Simulating success notification:`, { title, message });
      // Return a resolved promise to simulate network delay for UI feedback (spinner -> checkmark)
      return new Promise((resolve) => setTimeout(resolve, 800));
  }

  // Default Colors (Decimal format for Discord API)
  let color = 14362487; // Pink default (info)
  if (type === 'alert') color = 15158332; // Red
  if (type === 'success') color = 3066993; // Green
  if (type === 'milestone') color = 15844367; // Gold

  // Override if provided (e.g. for matching streak flames or ranks)
  if (customColor) {
      color = customColor;
  }

  const payload = {
    username: "Crescere Bot", 
    // Uses the app logo from Firebase Storage
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
    // Fire and forget - don't await response to block UI
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error("Failed to send Discord webhook", error);
  }
};
