const CACHE = 'montres-v11';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Ne jamais intercepter les appels API (Anthropic, Supabase, Google Fonts réseau)
  if (
    url.hostname.includes('anthropic.com') ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    return; // passe directement au réseau
  }

  // Pour les assets locaux : cache en priorité, réseau en fallback
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
