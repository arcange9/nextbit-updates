/**
 * POST /api/contact - store contact form submission
 */
const { connectDB, Contact, corsResponse, CORS_HEADERS } = require('./db');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  if (event.httpMethod !== 'POST') return corsResponse(405, { error: 'Method not allowed' });
  await connectDB();
  try {
    const { name, email, subject, message } = JSON.parse(event.body || '{}');
    if (!name || !email || !message) return corsResponse(400, { error: 'Name, email, and message are required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return corsResponse(400, { error: 'Valid email required' });
    await Contact.create({ name: name.trim(), email: email.toLowerCase().trim(), subject: subject || 'General Inquiry', message: message.trim() });
    return corsResponse(201, { message: "Message received! We'll get back to you within 24-48 hours." });
  } catch (err) { return corsResponse(500, { error: err.message }); }
};
