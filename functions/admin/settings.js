/**
 * PUT /api/admin/settings - update site settings (protected)
 */
const { connectDB, SiteSettings, corsResponse, CORS_HEADERS } = require('../db');
const jwt = require('jsonwebtoken');

function verifyToken(event) {
  const auth = (event.headers.authorization || event.headers.Authorization || '').replace('Bearer ', '').trim();
  if (!auth) return null;
  try { return jwt.verify(auth, process.env.JWT_SECRET); } catch { return null; }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  if (event.httpMethod !== 'PUT') return corsResponse(405, { error: 'Method not allowed' });
  if (!verifyToken(event)) return corsResponse(401, { error: 'Unauthorized. Please log in.' });
  await connectDB();
  try {
    const { companyName, logoUrl, copyrightYear, socialLinks } = JSON.parse(event.body || '{}');
    const update = { updatedAt: new Date() };
    if (companyName  !== undefined) update.companyName  = companyName.trim() || 'NextBit Updates';
    if (logoUrl      !== undefined) update.logoUrl      = logoUrl.trim();
    if (copyrightYear !== undefined) update.copyrightYear = parseInt(copyrightYear) || new Date().getFullYear();
    if (socialLinks) {
      update['socialLinks.youtube']   = socialLinks.youtube   || '';
      update['socialLinks.facebook']  = socialLinks.facebook  || '';
      update['socialLinks.twitter']   = socialLinks.twitter   || '';
      update['socialLinks.instagram'] = socialLinks.instagram || '';
    }
    const settings = await SiteSettings.findOneAndUpdate({ key: 'global' }, { $set: update }, { upsert: true, new: true });
    return corsResponse(200, { settings, message: 'Settings updated successfully' });
  } catch (err) { return corsResponse(500, { error: err.message }); }
};
