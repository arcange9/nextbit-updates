/**
 * GET /api/settings - public site settings
 */
const { connectDB, SiteSettings, corsResponse, CORS_HEADERS } = require('./db');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  if (event.httpMethod !== 'GET') return corsResponse(405, { error: 'Method not allowed' });
  await connectDB();
  try {
    let settings = await SiteSettings.findOne({ key: 'global' }).lean();
    if (!settings) {
      settings = {
        companyName: 'NextBit Updates', logoUrl: '',
        copyrightYear: new Date().getFullYear(),
        socialLinks: {
          youtube: 'https://youtube.com/channel/UC62YGDEkG-BLs4XC8gLn-Kw',
          facebook: 'https://facebook.com/NextBitUpdates',
          twitter: 'https://twitter.com/NextBitUpdates',
          instagram: 'https://instagram.com/NextBitUpdates',
        },
      };
    }
    return corsResponse(200, { settings });
  } catch (err) { return corsResponse(500, { error: err.message }); }
};
