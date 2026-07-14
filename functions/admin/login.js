/**
 * POST /api/admin/login - JWT authentication
 */
const { connectDB, User, corsResponse, CORS_HEADERS } = require('../db');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  if (event.httpMethod !== 'POST') return corsResponse(405, { error: 'Method not allowed' });
  await connectDB();
  try {
    const { email, password } = JSON.parse(event.body || '{}');
    if (!email || !password) return corsResponse(400, { error: 'Email and password required' });
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return corsResponse(401, { error: 'Invalid email or password' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return corsResponse(401, { error: 'Invalid email or password' });
    const secret = process.env.JWT_SECRET;
    if (!secret) return corsResponse(500, { error: 'JWT_SECRET not configured' });
    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, secret, { expiresIn: '7d' });
    return corsResponse(200, { token, message: 'Login successful' });
  } catch (err) { return corsResponse(500, { error: err.message }); }
};
