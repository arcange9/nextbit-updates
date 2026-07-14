/**
 * NextBit Updates - Shared DB + Models
 */
const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  isConnected = true;
}

const articleSchema = new mongoose.Schema({
  title:     { type: String, required: true, trim: true },
  slug:      { type: String, required: true, unique: true, lowercase: true },
  category:  { type: String, required: true, enum: ['Tech Updates', 'AI Tools'] },
  excerpt:   { type: String, default: '' },
  content:   { type: String, required: true },
  thumbnail: { type: String, default: '' },
  readTime:  { type: String, default: '3 min read' },
  published: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const subscriberSchema = new mongoose.Schema({
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  subscribedAt: { type: Date, default: Date.now },
});

const contactSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, trim: true, lowercase: true },
  subject:   { type: String, default: 'General Inquiry' },
  message:   { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  read:      { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema({
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true },
  role:      { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now },
});

const settingsSchema = new mongoose.Schema({
  key:           { type: String, required: true, unique: true, default: 'global' },
  companyName:   { type: String, default: 'NextBit Updates' },
  logoUrl:       { type: String, default: '' },
  copyrightYear: { type: Number, default: () => new Date().getFullYear() },
  socialLinks: {
    youtube:   { type: String, default: 'https://youtube.com/channel/UC62YGDEkG-BLs4XC8gLn-Kw' },
    facebook:  { type: String, default: 'https://facebook.com/NextBitUpdates' },
    twitter:   { type: String, default: 'https://twitter.com/NextBitUpdates' },
    instagram: { type: String, default: 'https://instagram.com/NextBitUpdates' },
  },
  updatedAt: { type: Date, default: Date.now },
});

const Article     = mongoose.models.Article     || mongoose.model('Article',     articleSchema);
const Subscriber  = mongoose.models.Subscriber  || mongoose.model('Subscriber',  subscriberSchema);
const Contact     = mongoose.models.Contact     || mongoose.model('Contact',     contactSchema);
const User        = mongoose.models.User        || mongoose.model('User',        userSchema);
const SiteSettings = mongoose.models.SiteSettings || mongoose.model('SiteSettings', settingsSchema);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

function corsResponse(statusCode, body) {
  return { statusCode, headers: CORS_HEADERS, body: JSON.stringify(body) };
}

module.exports = { connectDB, Article, Subscriber, Contact, User, SiteSettings, CORS_HEADERS, corsResponse };
