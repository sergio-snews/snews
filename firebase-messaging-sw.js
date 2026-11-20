// SNEWS — service worker: сповіщення Firebase + робота без інтернету
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCx2ZTsYQLQwuSVAqk_RLweBRIWrMRqKfw",
  authDomain: "snews-79501.firebaseapp.com",
  projectId: "snews-79501",
  storageBucket: "snews-79501.firebasestorage.app",
  messagingSenderId: "96145079969",
  appId: "1:96145079969:web:210e3054e800165152bae0"
});
// Сповіщення з полем notification Firebase показує сам, коли застосунок закритий
firebase.messaging();

const CACHE = 'snews-v1';
const SHELL = ['./', 'index.html', 'manifest.json', 'logo.png', 'icon-192.png', 'icon-512.png',
               'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Сторінка й файли: спершу мережа (щоб оновлення приходили одразу), без мережі — збережена копія
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.hostname.includes('script.google')) return;
  if (url.origin !== location.origin && !url.hostname.includes('cdnjs')) return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});
