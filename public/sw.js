self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('fox-store').then((cache) => cache.addAll([
      '/v/style.css',
      '/v/app.js',
      '/v/index.html',
      '/icon.png',
			'/index.html',
      '/manifest.webmanifest',
      '/sw.js',
			'/components.js',
			'/add/index.html',
			'/add/view.html',
			'/app/index.html',
			'/socket.io/socket.io.js'
    ])),
  );
});

self.addEventListener('fetch', (e) => {
  console.log(e.request.url);
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});
