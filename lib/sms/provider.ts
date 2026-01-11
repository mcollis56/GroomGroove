// SMS Provider Abstraction
// Twilio-style implementation - swap provider by changing this file

interface SendSMSParams {
  to: string
  body: string
}

interface SendSMSResult {
  success: boolean
  messageId?: string
  error?: string
}

interface SMSProvider {
  send(params: SendSMSParams): Promise<SendSMSResult>
}

// Twilio implementation
class TwilioProvider implements SMSProvider {
  private accountSid: string
  private authToken: string
  private fromNumber: string

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || ''
    this.authToken = process.env.TWILIO_AUTH_TOKEN || ''
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || ''
  }

  async send({ to, body }: SendSMSParams): Promise<SendSMSResult> {
    // In production, use actual Twilio SDK
    // For now, log and simulate success
    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      console.log('[SMS Mock] Would send to:', to)
      console.log('[SMS Mock] Message:', body)
      return { success: true, messageId: `mock-${Date.now()}` }
    }

    try {
      // Production Twilio implementation:
      // const twilio = require('twilio')(this.accountSid, this.authToken)
      // const message = await twilio.messages.create({
      //   body,
      //   from: this.fromNumber,
      //   to,
      // })
      // return { success: true, messageId: message.sid }

      // Mock for development
      console.log('[SMS] Sending to:', to)
      console.log('[SMS] Message:', body)
      return { success: true, messageId: `twilio-${Date.now()}` }
    } catch (error: any) {
      console.error('[SMS Error]', error)
      return { success: false, error: error.message }
    }
  }
}

// Export singleton instance
export const smsProvider: SMSProvider = new TwilioProvider()
