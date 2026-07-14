/**
 * GET /api/articles        - list published articles
 * GET /api/articles/:slug  - single article by slug
 */
const { connectDB, Article, corsResponse, CORS_HEADERS } = require('./db');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  await connectDB();

  const pathParts = (event.path || '').split('/').filter(Boolean);
  const lastPart  = pathParts[pathParts.length - 1];
  const isSlug    = lastPart && lastPart !== 'articles';

  if (event.httpMethod === 'GET' && isSlug) {
    try {
      const article = await Article.findOne({ slug: lastPart, published: true }).lean();
      if (!article) return corsResponse(404, { error: 'Article not found' });
      return corsResponse(200, { article });
    } catch (err) { return corsResponse(500, { error: err.message }); }
  }

  if (event.httpMethod === 'GET') {
    try {
      const p        = event.queryStringParameters || {};
      const limit    = Math.min(parseInt(p.limit)  || 10, 50);
      const page     = Math.max(parseInt(p.page)   || 1, 1);
      const skip     = (page - 1) * limit;
      const query    = { published: true };
      if (p.category) query.category = p.category;
      const [articles, total] = await Promise.all([
        Article.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Article.countDocuments(query),
      ]);
      return corsResponse(200, { articles, total, page, limit });
    } catch (err) { return corsResponse(500, { error: err.message }); }
  }

  return corsResponse(405, { error: 'Method not allowed' });
};
