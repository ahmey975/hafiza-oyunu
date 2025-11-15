const CACHE_NAME = 'murat-sener-drift-game-cache-v1';
const urlsToCache = [
    '/ArabaOyunu.html',
    '/manifest.json',
    '/car-icon-192x192.png', // Uygulama ikonları
    '/car-icon-512x512.png',
    'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700;800&display=swap', // Google fontları (CSS)
    'https://fonts.gstatic.com/s/opensans/v27/mem8YaGs126MiZpBA-UFVZ0e.woff2' // Open Sans fontunun kendisi
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
                    return response; // Önbellekte varsa önbellekten döndür
                }
                return fetch(event.request) // Yoksa ağdan çek
                    .then(networkResponse => {
                        // Ağdan gelen başarılı yanıtı önbelleğe al
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
                        // Hem önbellekte yoksa hem de ağ hatası varsa
                        console.log('Service Worker: Fetch failed and no cache match for ', event.request.url);
                        // Hata sayfası veya offline mesajı döndürebilirsiniz
                        return new Response('Bu içerik çevrimdışı kullanılamıyor.', {status: 503});
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
                    // Yeni olmayan önbellekleri sil
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Deleting old cache: ', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});