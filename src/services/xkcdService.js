const fetch = require('node-fetch');

class XKCDService {
  constructor() {
    this.baseUrl = 'https://xkcd.com';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async getLatest() {
    const cacheKey = 'latest';
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const response = await fetch(`${this.baseUrl}/info.0.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const comic = await response.json();
    const processed = this.processComic(comic);
    this.cache.set(cacheKey, { data: processed, timestamp: Date.now() });
    return processed;
  }

  // ✅ getById
  async getById(id) {
    const n = Number(id);
    if (!Number.isInteger(n) || n < 1) {
      throw new Error('Invalid comic ID');
    }

    const cacheKey = `comic-${n}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const resp = await fetch(`${this.baseUrl}/${n}/info.0.json`);
    if (resp.status === 404) throw new Error('Comic not found');
    if (!resp.ok) {
      const e = new Error('Failed to fetch comic');
      e.isOperational = true;
      e.statusCode = resp.status;
      throw e;
    }

    const data = await resp.json();
    const comic = this.processComic(data);
    this.cache.set(cacheKey, { data: comic, timestamp: Date.now() });
    return comic;
  }

  // ✅ getRandom
  async getRandom() {
    const latest = await this.getLatest();
    const maxId = latest.id;
    const randomId = Math.floor(Math.random() * maxId) + 1;
    return this.getById(randomId);
  }

  // ✅ search
  async search(query, page = 1, limit = 10) {
    if (typeof query !== 'string' || query.length < 1 || query.length > 100) {
      throw new Error('Invalid search query');
    }

    page = Number(page) || 1;
    limit = Number(limit) || 10;

    const latest = await this.getLatest();
    const maxId = latest.id;
    const startId = Math.max(1, maxId - 100);
    const q = query.toLowerCase();
    const matches = [];

    for (let i = maxId; i >= startId; i--) {
      try {
        const c = await this.getById(i);
        const title = (c.title || '').toLowerCase();
        const transcript = (c.transcript || '').toLowerCase();
        if (title.includes(q) || transcript.includes(q)) {
          matches.push(c);
        }
      } catch {
        // skip missing comics
      }
    }

    const offset = (page - 1) * limit;
    const results = matches.slice(offset, offset + limit);

    return {
      query,
      results,
      total: matches.length,
      pagination: { page, limit }
    };
  }

  processComic(comic) {
    return {
      id: comic.num,
      title: comic.title,
      img: comic.img,
      alt: comic.alt,
      transcript: comic.transcript || '',
      year: comic.year,
      month: comic.month,
      day: comic.day,
      safe_title: comic.safe_title
    };
  }
}

module.exports = new XKCDService();
