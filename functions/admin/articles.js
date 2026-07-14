/**
 * GET    /api/admin/articles     - list all articles + counts
 * POST   /api/admin/articles     - create article
 * DELETE /api/admin/articles/:id - delete article
 */
const { connectDB, Article, Subscriber, Contact, corsResponse, CORS_HEADERS } = require('../db');
const jwt = require('jsonwebtoken');

function verifyToken(event) {
  const auth  = (event.headers.authorization || event.headers.Authorization || '').replace('Bearer ', '').trim();
  if (!auth) return null;
  try { return jwt.verify(auth, process.env.JWT_SECRET); } catch { return null; }
}

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim() + '-' + Date.now();
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  if (!verifyToken(event)) return corsResponse(401, { error: 'Unauthorized. Please log in.' });
  await connectDB();

  const pathParts = (event.path || '').split('/').filter(Boolean);
  const lastPart  = pathParts[pathParts.length - 1];
  const articleId = (lastPart && lastPart !== 'articles') ? lastPart : null;

  if (event.httpMethod === 'GET' && !articleId) {
    try {
      const [articles, subscriberCount, contactCount] = await Promise.all([
        Article.find({}).sort({ createdAt: -1 }).lean(),
        Subscriber.countDocuments(),
        Contact.countDocuments(),
      ]);
      return corsResponse(200, { articles, subscriberCount, contactCount });
    } catch (err) { return corsResponse(500, { error: err.message }); }
  }

  if (event.httpMethod === 'POST' && !articleId) {
    try {
      const { title, category, excerpt, content, thumbnail, readTime, published } = JSON.parse(event.body || '{}');
      if (!title || !category || !content) return corsResponse(400, { error: 'Title, category, and content are required' });
      const slug    = generateSlug(title);
      const article = await Article.create({ title: title.trim(), slug, category, excerpt: excerpt || '', content: content.trim(), thumbnail: thumbnail || '', readTime: readTime || '3 min read', published: published !== false });
      return corsResponse(201, { article, message: 'Article created successfully' });
    } catch (err) { return corsResponse(500, { error: err.message }); }
  }

  if (event.httpMethod === 'DELETE' && articleId) {
    try {
      const deleted = await Article.findByIdAndDelete(articleId);
      if (!deleted) return corsResponse(404, { error: 'Article not found' });
      return corsResponse(200, { message: 'Article deleted' });
    } catch (err) { return corsResponse(500, { error: err.message }); }
  }

  return corsResponse(405, { error: 'Method not allowed' });
};
