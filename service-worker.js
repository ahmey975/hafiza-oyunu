const CACHE_NAME = 'murat-sener-memory-game-cache-v1';
const urlsToCache = [
    '/HafizaOyunu.html',
    'https://i.imgur.com/KPkEoOK.png', // Oyun logosu
    'https://www.bensound.com/bensound-music/bensound-sunny.mp3', // Arkaplan müziği
    'https://fonts.googleapis.com/css2?family=Poppins:wght@400;700;900&display=swap', // Google fontları (CSS)
    'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLCzLEpk.woff2', // Poppins fontunun kendisi (Woff2 formatı)
];

self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching App Shell');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log('Service Worker: Fetching from Cache: ', event.request.url);
                    return response;
                }
                console.log('Service Worker: Fetching from Network: ', event.request.url);
                return fetch(event.request)
                    .then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        console.log('Service Worker: Fetch failed and no cache match for ', event.request.url);
                        return new Response('Offline content is not available and no network connection.', {status: 503});
                    });
            })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Deleting old cache: ', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});