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

self.addEventListener('notificationclick', function(e) {
  var notification = e.notification;
  var primaryKey = notification.data.primaryKey;
  var action = e.action;

  if (action.startsWith("view_")) {
		var id = action.replace("view_", "");
    clients.openWindow('https://${__vars/hostname}/r/'+id);
    notification.close();
  }
	else {
		console.log("KEY: " + action)
	}
});