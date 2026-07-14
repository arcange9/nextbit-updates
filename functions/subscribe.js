/**
 * POST /api/subscribe - store email in Subscriber collection
 */
const { connectDB, Subscriber, corsResponse, CORS_HEADERS } = require('./db');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  if (event.httpMethod !== 'POST') return corsResponse(405, { error: 'Method not allowed' });
  await connectDB();
  try {
    const { email } = JSON.parse(event.body || '{}');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return corsResponse(400, { error: 'A valid email address is required' });
    const existing = await Subscriber.findOne({ email: email.toLowerCase().trim() });
    if (existing) return corsResponse(200, { message: 'You are already subscribed!' });
    await Subscriber.create({ email: email.toLowerCase().trim() });
    return corsResponse(201, { message: 'Successfully subscribed! Welcome to NextBit Updates.' });
  } catch (err) {
    if (err.code === 11000) return corsResponse(200, { message: 'You are already subscribed!' });
    return corsResponse(500, { error: err.message });
  }
};
