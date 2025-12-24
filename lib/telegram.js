// Utilitar pentru trimiterea notificărilor Telegram

const TELEGRAM_ORDERS_BOT_TOKEN = process.env.TELEGRAM_ORDERS_BOT_TOKEN
const TELEGRAM_ORDERS_CHAT_ID = process.env.TELEGRAM_ORDERS_CHAT_ID
const TELEGRAM_PAYMENTS_BOT_TOKEN = process.env.TELEGRAM_PAYMENTS_BOT_TOKEN
const TELEGRAM_PAYMENTS_CHAT_ID = process.env.TELEGRAM_PAYMENTS_CHAT_ID

/**
 * Trimite un mesaj prin Telegram Bot API
 * @param {string} botToken - Token-ul botului Telegram
 * @param {string} chatId - ID-ul chat-ului/grupului
 * @param {string} message - Mesajul de trimis (suportă Markdown)
 * @param {string} parseMode - Modul de parsare ('Markdown' sau 'HTML')
 */
async function sendTelegramMessage(botToken, chatId, message, parseMode = 'Markdown') {
  if (!botToken || !chatId) {
    console.log('Telegram credentials not configured, skipping notification')
    return { success: false, error: 'Credentials not configured' }
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: parseMode,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok || !data.ok) {
      console.error('Telegram API error:', data)
      return { success: false, error: data.description || 'Unknown error' }
    }

    return { success: true, messageId: data.result.message_id }
  } catch (error) {
    console.error('Error sending Telegram message:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Notificare pentru comandă nouă
 * @param {Object} order - Obiectul comenzii
 * @param {Object} user - Obiectul utilizatorului
 */
export async function notifyNewOrder(order, user) {
  const itemsList = order.items
    .map(item => `  • ${item.quantity}x ${item.name} - €${(item.price * item.quantity).toFixed(2)}`)
    .join('\n')

  const message = `
🍕 *COMANDĂ NOUĂ* #${order.id.slice(-6).toUpperCase()}

👤 *Client:* ${user?.name || 'Anonim'}
📧 *Email:* ${user?.email || 'N/A'}
📱 *Telefon:* ${order.phone || 'N/A'}

📍 *Adresa de livrare:*
${order.deliveryAddress || 'N/A'}

🛒 *Produse:*
${itemsList}

💰 *Subtotal:* €${(order.total - (order.deliveryFee || 0)).toFixed(2)}
🚚 *Livrare:* €${(order.deliveryFee || 0).toFixed(2)}
💵 *TOTAL:* €${order.total.toFixed(2)}

💳 *Metodă plată:* ${order.paymentMethod === 'paypal' ? 'PayPal' : 'Card'}
✅ *Status plată:* ${order.isPaid ? 'Plătit' : 'Neplătit'}

⏱ *Timp estimat:* ${order.estimatedTime} minute
${order.notes ? `\n📝 *Note:* ${order.notes}` : ''}

🕐 *Data:* ${new Date(order.createdAt).toLocaleString('ro-RO', { 
    timeZone: 'Europe/Bucharest',
    dateStyle: 'short',
    timeStyle: 'short'
  })}
`

  return sendTelegramMessage(
    TELEGRAM_ORDERS_BOT_TOKEN,
    TELEGRAM_ORDERS_CHAT_ID,
    message
  )
}

/**
 * Notificare pentru plată reușită
 * @param {Object} order - Obiectul comenzii
 * @param {Object} user - Obiectul utilizatorului
 * @param {string} paymentMethod - Metoda de plată
 * @param {string} transactionId - ID-ul tranzacției (optional)
 */
export async function notifyPaymentReceived(order, user, paymentMethod = 'PayPal', transactionId = null) {
  const message = `
💳 *PLATĂ PRIMITĂ*

🆔 *Comandă:* #${order.id.slice(-6).toUpperCase()}
👤 *Client:* ${user?.name || 'Anonim'}
📧 *Email:* ${user?.email || 'N/A'}

💰 *Sumă:* €${order.total.toFixed(2)}
💳 *Metodă:* ${paymentMethod}
${transactionId ? `🔑 *ID Tranzacție:* ${transactionId}` : ''}

✅ *Status:* Plată confirmată

🕐 *Data:* ${new Date().toLocaleString('ro-RO', { 
    timeZone: 'Europe/Bucharest',
    dateStyle: 'short',
    timeStyle: 'short'
  })}
`

  return sendTelegramMessage(
    TELEGRAM_PAYMENTS_BOT_TOKEN,
    TELEGRAM_PAYMENTS_CHAT_ID,
    message
  )
}

/**
 * Notificare pentru schimbare status comandă
 * @param {Object} order - Obiectul comenzii
 * @param {string} newStatus - Noul status
 * @param {string} newStage - Noua etapă
 */
export async function notifyOrderStatusChange(order, newStatus, newStage) {
  const stageEmojis = {
    RECEIVED: '📥',
    PREPARING: '👨‍🍳',
    READY: '✅',
    OUT_DELIVERY: '🚗',
    DELIVERED: '🏠'
  }

  const stageNames = {
    RECEIVED: 'Primită',
    PREPARING: 'În preparare',
    READY: 'Gata de livrare',
    OUT_DELIVERY: 'În curs de livrare',
    DELIVERED: 'Livrată'
  }

  const statusEmojis = {
    PENDING: '⏳',
    CONFIRMED: '✅',
    COMPLETED: '🎉',
    CANCELLED: '❌'
  }

  const message = `
${stageEmojis[newStage] || '📦'} *ACTUALIZARE COMANDĂ*

🆔 *Comandă:* #${order.id.slice(-6).toUpperCase()}
${statusEmojis[newStatus] || '📋'} *Status:* ${newStatus}
${stageEmojis[newStage] || '📦'} *Etapă:* ${stageNames[newStage] || newStage}

🕐 *Actualizat:* ${new Date().toLocaleString('ro-RO', { 
    timeZone: 'Europe/Bucharest',
    dateStyle: 'short',
    timeStyle: 'short'
  })}
`

  return sendTelegramMessage(
    TELEGRAM_ORDERS_BOT_TOKEN,
    TELEGRAM_ORDERS_CHAT_ID,
    message
  )
}

/**
 * Notificare pentru anulare comandă
 * @param {Object} order - Obiectul comenzii
 * @param {string} reason - Motivul anulării (optional)
 */
export async function notifyOrderCancelled(order, reason = null) {
  const message = `
❌ *COMANDĂ ANULATĂ*

🆔 *Comandă:* #${order.id.slice(-6).toUpperCase()}
💰 *Valoare:* €${order.total.toFixed(2)}
${reason ? `\n📝 *Motiv:* ${reason}` : ''}

🕐 *Data:* ${new Date().toLocaleString('ro-RO', { 
    timeZone: 'Europe/Bucharest',
    dateStyle: 'short',
    timeStyle: 'short'
  })}
`

  return sendTelegramMessage(
    TELEGRAM_ORDERS_BOT_TOKEN,
    TELEGRAM_ORDERS_CHAT_ID,
    message
  )
}

export default {
  notifyNewOrder,
  notifyPaymentReceived,
  notifyOrderStatusChange,
  notifyOrderCancelled
}
