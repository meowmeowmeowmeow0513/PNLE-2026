// src/utils/discordWebhook.ts

// ⚠️ KEEP THIS SECRET: Anyone with this URL can post to your channel.
const WEBHOOK_URL = "https://discord.com/api/webhooks/1450057157809799168/xvfENXULIQBXJ4dp6DOayi1FbTwNB3JeYr6yMJtDd3C-3NgLgye7p--Pg3oeykvlZ7qk";

export const sendDiscordNotification = async (
  title: string, 
  message: string, 
  type: 'info' | 'alert' | 'success' = 'info'
) => {
  if (!WEBHOOK_URL) return;

  // Colors: Pink (Info), Red (Alert), Green (Success)
  const color = type === 'alert' ? 15158332 : type === 'success' ? 3066993 : 14362487;

  const payload = {
    username: "Crescere Bot", // Name displayed in Discord
    avatar_url: "https://firebasestorage.googleapis.com/v0/b/pnle-review-companion.firebasestorage.app/o/WebsiteLogo.png?alt=media&token=618c2ca2-f87c-4daf-9b2b-0342976a7567", // Uses your app logo
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
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      console.log("✅ Discord Notification Sent!");
    } else {
      console.error("❌ Discord Error:", response.statusText);
    }
  } catch (error) {
    console.error("❌ Failed to send Discord webhook", error);
  }
};