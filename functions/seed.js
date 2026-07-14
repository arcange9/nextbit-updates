/**
 * NextBit Updates - One-time DB seed
 * Visit: https://YOUR-SITE.netlify.app/.netlify/functions/seed?key=nextbit-seed-2025
 */
const { connectDB, User, SiteSettings, Article, corsResponse, CORS_HEADERS } = require('./db');
const bcrypt = require('bcryptjs');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS_HEADERS, body: '' };

  const seedKey     = (event.queryStringParameters || {}).key;
  const expectedKey = process.env.SEED_SECRET || 'nextbit-seed-2025';
  if (seedKey !== expectedKey) {
    return corsResponse(403, {
      error: 'Forbidden. Provide ?key=YOUR_SEED_SECRET',
      hint:  'Default key: nextbit-seed-2025'
    });
  }

  await connectDB();
  const results = { created: [], skipped: [], errors: [] };

  // 1. Admin User
  try {
    if (await User.findOne({ email: 'nextbitupdates@gmail.com' })) {
      results.skipped.push('Admin user (already exists)');
    } else {
      const hashed = await bcrypt.hash('NextBit2009@', 12);
      await User.create({ email: 'nextbitupdates@gmail.com', password: hashed, role: 'admin' });
      results.created.push('Admin user: nextbitupdates@gmail.com');
    }
  } catch (err) { results.errors.push('Admin: ' + err.message); }

  // 2. Default Settings
  try {
    if (await SiteSettings.findOne({ key: 'global' })) {
      results.skipped.push('Site settings (already exist)');
    } else {
      await SiteSettings.create({
        key: 'global', companyName: 'NextBit Updates', logoUrl: '',
        copyrightYear: new Date().getFullYear(),
        socialLinks: {
          youtube:   'https://youtube.com/channel/UC62YGDEkG-BLs4XC8gLn-Kw',
          facebook:  'https://facebook.com/NextBitUpdates',
          twitter:   'https://twitter.com/NextBitUpdates',
          instagram: 'https://instagram.com/NextBitUpdates',
        },
      });
      results.created.push('Default site settings');
    }
  } catch (err) { results.errors.push('Settings: ' + err.message); }

  // 3. Sample Articles
  const samples = [
    {
      title: 'Top 10 AI Tools to Make Money Online in 2025',
      slug:  'top-10-ai-tools-make-money-2025',
      category: 'AI Tools',
      excerpt: 'Discover the most powerful AI tools helping creators and entrepreneurs generate real income online in 2025.',
      content: '<h2>The AI Money-Making Revolution</h2><p>Artificial intelligence has fundamentally changed how people earn money online. From content creation to automation, AI tools are levelling the playing field for everyday entrepreneurs.</p><h2>1. ChatGPT / Claude</h2><p>Use LLMs to write blog posts, create marketing copy, build chatbots, and develop digital products at scale.</p><h2>2. Midjourney</h2><p>Generate stunning images for digital products, print-on-demand stores, social media, and client work.</p><h2>3. ElevenLabs</h2><p>Create realistic voiceovers for YouTube, podcasts, e-learning, and audiobooks. Voice cloning opens passive income streams.</p><h2>Getting Started</h2><p>Pick one AI tool, learn it deeply, and find where it creates the most value for others.</p><blockquote>The best AI tool is the one you actually use to generate value. Start simple, get good, scale fast.</blockquote>',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
      readTime: '6 min read', published: true,
    },
    {
      title: 'Gemini vs GPT-4o: Which AI Wins for Making Money?',
      slug:  'gemini-vs-gpt4o-make-money-comparison',
      category: 'Tech Updates',
      excerpt: "Head-to-head comparison of Google Gemini and OpenAI GPT-4o focused on real-world money-making use cases.",
      content: '<h2>The Battle of AI Giants</h2><p>Two of the most powerful AI models are competing for your workflow. Which one actually helps you earn more?</p><h2>Content Creation: GPT-4o Wins</h2><p>For long-form content and marketing copy, GPT-4o consistently produces more polished output with better tone control.</p><h2>Research & Analysis: Gemini Wins</h2><p>Gemini\'s data processing and Google Search integration makes it superior for market research and trend analysis.</p><h2>Our Verdict</h2><p>Use both strategically. GPT-4o for content and copywriting. Gemini for research and Google Workspace integration.</p>',
      thumbnail: 'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&q=80',
      readTime: '5 min read', published: true,
    },
    {
      title: 'How to Build a $5,000/Month Passive Income with AI Content Sites',
      slug:  'build-5000-month-passive-income-ai-content',
      category: 'AI Tools',
      excerpt: 'Step-by-step guide to building a niche AI-powered content site that generates consistent passive income through ads and affiliates.',
      content: '<h2>The AI Content Site Blueprint</h2><p>Niche content websites monetised through display ads and affiliate marketing are one of the most accessible passive income models today — and AI makes them faster to build than ever.</p><h2>Step 1: Choose Your Niche</h2><p>Focus on topics with high RPM. Finance, tech, health, and software reviews consistently pay the highest ad rates.</p><h2>Step 2: Build Your Content Engine</h2><p>Use ChatGPT or Claude to generate article outlines and drafts. Always add human expertise and fact-check everything.</p><h2>Step 3: SEO is Non-Negotiable</h2><p>Target long-tail keywords. AI can help you generate topical authority maps and identify content gaps quickly.</p><h2>Step 4: Monetise</h2><ul><li>Apply to Mediavine or AdThrive at 50,000 monthly sessions</li><li>Weave affiliate links naturally into relevant articles</li><li>Build an email list from day one</li></ul>',
      thumbnail: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80',
      readTime: '8 min read', published: true,
    },
  ];

  for (const art of samples) {
    try {
      if (await Article.findOne({ slug: art.slug })) {
        results.skipped.push('Article: ' + art.title);
      } else {
        await Article.create(art);
        results.created.push('Article: ' + art.title);
      }
    } catch (err) { results.errors.push('Article "' + art.title + '": ' + err.message); }
  }

  return corsResponse(200, {
    message: 'Seed completed! NextBit Updates is ready.',
    results,
    nextSteps: [
      '1. Visit /admin.html to log in',
      '2. Email: nextbitupdates@gmail.com | Password: NextBit2009@',
      '3. Go to Settings to update your logo and social links',
      '4. Create your first article from the Dashboard',
      '5. SECURITY: Delete or disable seed.js after first run',
    ],
  });
};
