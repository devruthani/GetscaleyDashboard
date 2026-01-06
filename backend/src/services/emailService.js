import nodemailer from 'nodemailer'
import { config } from '../config/config.js'
import { logger } from '../logging/logger.js'

// Initialize the transporter
// In production, this uses the SMTP settings from config.js
// In development, you might want to use Ethereal (https://ethereal.email) for testing
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure, // true for 465, false for other ports
  auth: {
    user: config.email.auth.user,
    pass: config.email.auth.pass,
  },
})

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} [options.html] - HTML body
 * @returns {Promise<Object>} - The result of the send operation
 */
export async function sendEmail({ to, subject, text, html }) {
  try {
    const info = await transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      text,
      html,
    })

    logger.info(`Email sent: ${info.messageId}`)
    return info
  } catch (error) {
    logger.error('Error sending email:', error)
    throw error
  }
}

/**
 * Example: Send a Welcome Email
 * This demonstrates how to wrap the generic sendEmail function for specific use cases.
 */
export async function sendWelcomeEmail(userEmail, userName) {
  const subject = 'Welcome to GetScaley Dashboard!'
  const text = `Hi ${userName},\n\nWelcome to GetScaley! We're glad to have you on board.`
  const html = `
    <h1>Welcome, ${userName}!</h1>
    <p>We're glad to have you on board.</p>
    <p>Click <a href="#">here</a> to get started.</p>
  `
  return sendEmail({ to: userEmail, subject, text, html })
}
