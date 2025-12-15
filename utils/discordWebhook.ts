
// src/utils/discordWebhook.ts

const WEBHOOK_UPDATES = "https://discord.com/api/webhooks/1450060976216080491/o_SzX9Zli5Ez7Yt62KDmIW7izbDRR3z9XsgBVqbDDh3zaTzaA0lX6oNdBdNl-ZHitvXf";
const WEBHOOK_STATS = "https://discord.com/api/webhooks/1450060815326642237/19-aT9orlBaMh__kntc5OS22jHjyGG-1LU0F7fgpwyYO1t7RZXFOHQcV1vKcMlfOKA1p";

export type DiscordChannel = 'updates' | 'stats';

export const sendDiscordNotification = async (
  title: string, 
  message: string, 
  channel: DiscordChannel = 'stats',
  type: 'info' | 'alert' | 'success' | 'milestone' = 'info',
  customColor?: number // Optional specific color override
) => {
  const url = channel === 'updates' ? WEBHOOK_UPDATES : WEBHOOK_STATS;

  // Default Colors
  let color = 14362487; // Pink default
  if (type === 'alert') color = 15158332; // Red
  if (type === 'success') color = 3066993; // Green
  if (type === 'milestone') color = 15844367; // Gold

  // Override if provided (e.g. for matching streak flames or ranks)
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
          text: "PNLE Review Companion App"
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    // Fire and forget - don't await response to block UI
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => console.error("Discord Webhook Error:", err));
  } catch (error) {
    console.error("Failed to send Discord webhook", error);
  }
};
