// Nome della cache: aggiorna la versione quando modifichi i file in cache
const CACHE_NAME = 'cache-v1';

// Risorse da salvare in cache: includi qui index.html, CSS, JS e altri file statici
const urlsToCache = [
  '/',               // La root
  '/index.html',
  '/style.css',
  '/script.js',      // Il file già presente (gestione di localStorage, caroselli, ecc.)
  '/home.js'         // Il nuovo file JS per la gestione della tab-bar e dello scroll
];

// Installazione del service worker: apri la cache e aggiungi i file statici
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Apro la cache e salvo le risorse predefinite');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Errore durante il caching in fase di installazione', error);
      })
  );
  // Forza l'attivazione immediata
  self.skipWaiting();
});

// Attivazione del service worker: elimina le cache vecchie
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames =>
        Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Rimuovo la cache vecchia:', cacheName);
              return caches.delete(cacheName);
            }
          })
        )
      )
  );
  self.clients.claim();
});

// Gestione delle richieste: risponde dalla cache se disponibile, altrimenti dal network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Se la risorsa è presente in cache, restituiscila
        if (cachedResponse) {
          return cachedResponse;
        }
        // Altrimenti, esegue la richiesta di rete e cache la risposta per usi futuri
        return fetch(event.request)
          .then(networkResponse => {
            // Verifica se la risposta è valida
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            // Clona e salva la risposta in cache
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return networkResponse;
          });
      })
      .catch(error => {
        console.error('Errore nel recupero dalla cache o dal network:', error);
      })
  );
});
