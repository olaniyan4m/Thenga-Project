// js13kPWA Service Worker - Business App
const cacheName = 'Thenga-business-v1';
const appShellFiles = [
    '/',
    '/index.html',
    '/manifest.json',
    '/sw.js',
    '/assets/index-D7ZXutcm.css',
    '/assets/index-DQvnvixL.js',
    '/icon-72.png',
    '/icon-96.png',
    '/icon-128.png',
    '/icon-144.png',
    '/icon-152.png',
    '/icon-192.png',
    '/icon-384.png',
    '/icon-512.png',
    '/icon-192-maskable.png',
    '/icon-512-maskable.png',
    '/offline.html'
];

// Dynamic content to cache
const dynamicContentToCache = [
    '/data/business.js'
];

const contentToCache = appShellFiles.concat(dynamicContentToCache);

// Installation
self.addEventListener('install', (e) => {
    console.log('[Service Worker] Install');
    e.waitUntil(
        (async () => {
            const cache = await caches.open(cacheName);
            console.log('[Service Worker] Caching all: app shell and content');
            await cache.addAll(contentToCache);
        })(),
    );
});

// Activation
self.addEventListener('activate', (e) => {
    console.log('[Service Worker] Activate');
    e.waitUntil(
        caches.keys().then((keyList) =>
            Promise.all(
                keyList.map((key) => {
                    if (key === cacheName) {
                        return undefined;
                    }
                    return caches.delete(key);
                }),
            ),
        ),
    );
});

// Fetch Strategy
self.addEventListener('fetch', (e) => {
    e.respondWith(
        (async () => {
            const r = await caches.match(e.request);
            console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
            if (r) {
                return r;
            }
            const response = await fetch(e.request);
            const cache = await caches.open(cacheName);
            console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
            cache.put(e.request, response.clone());
            return response;
        })(),
    );
});

// Push Notifications
self.addEventListener('push', (event) => {
    event.waitUntil(
        self.registration.showNotification('Thenga Business', {
            body: 'New business update available',
            icon: '/icon-192.png',
            data: { path: '/#business/dashboard' }
        })
    );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    var fullPath = self.location.origin + event.notification.data.path;
    clients.openWindow(fullPath);
});

// Background Sync
self.addEventListener('sync', event => {
    if (event.tag === 'database-sync') {
        event.waitUntil(
            (async () => {
                console.log('[Service Worker] Performing background sync for database-sync');
                // Example: fetch('/api/sync-data', { method: 'POST', body: '...' });
                return new Promise(resolve => setTimeout(resolve, 2000)); // Simulate async work
            })()
        );
    }
    if (event.tag === 'orders-sync') {
        event.waitUntil(
            (async () => {
                console.log('[Service Worker] Performing background sync for orders-sync');
                return new Promise(resolve => setTimeout(resolve, 2000));
            })()
        );
    }
    if (event.tag === 'payments-sync') {
        event.waitUntil(
            (async () => {
                console.log('[Service Worker] Performing background sync for payments-sync');
                return new Promise(resolve => setTimeout(resolve, 2000));
            })()
        );
    }
});

// Periodic Background Sync
self.addEventListener('periodicsync', event => {
    if (event.tag === 'fetch-new-content') {
        event.waitUntil(
            (async () => {
                console.log('[Service Worker] Performing periodic background sync for new content');
                return new Promise(resolve => setTimeout(resolve, 2000));
            })()
        );
    }
    if (event.tag === 'analytics-sync') {
        event.waitUntil(
            (async () => {
                console.log('[Service Worker] Performing periodic background sync for analytics');
                return new Promise(resolve => setTimeout(resolve, 2000));
            })()
        );
    }
});

// Windows Widgets Board Implementation
self.addEventListener("widgetinstall", event => {
    event.waitUntil(onWidgetInstall(event.widget));
});

self.addEventListener("widgetuninstall", event => {
    event.waitUntil(onWidgetUninstall(event.widget));
});

self.addEventListener("widgetresume", event => {
    event.waitUntil(updateWidget(event.widget));
});

self.addEventListener('widgetclick', (event) => {
    switch (event.action) {
        case 'dashboard-action':
            // Application logic for dashboard action
            break;
        case 'orders-action':
            // Application logic for orders action
            break;
        case 'payments-action':
            // Application logic for payments action
            break;
    }
});

async function onWidgetInstall(widget) {
    // Register a periodic sync, if this wasn't done already.
    const tags = await self.registration.periodicSync.getTags();
    if (!tags.includes(widget.definition.tag)) {
        await self.registration.periodicSync.register(widget.definition.tag, {
            minInterval: widget.definition.update
        });
    }
    
    // And also update the instance.
    await updateWidget(widget);
}

async function onWidgetUninstall(widget) {
    // On uninstall, unregister the periodic sync.
    if (widget.instances.length === 1 && "update" in widget.definition) {
        await self.registration.periodicSync.unregister(widget.definition.tag);
    }
}

// Listen to periodicsync events to update all widget instances
self.addEventListener("periodicsync", async event => {
    const widget = await self.widgets.getByTag(event.tag);
    
    if (widget && "update" in widget.definition) {
        event.waitUntil(updateWidget(widget));
    }
});

async function updateWidget(widget) {
    // Get the template and data URLs from the widget definition.
    const templateUrl = widget.definition.msAcTemplate;
    const dataUrl = widget.definition.data;
    
    // Fetch the template text and data.
    const template = await (await fetch(templateUrl)).text();
    const data = await (await fetch(dataUrl)).text();
    
    // Render the widget with the template and data.
    await self.widgets.updateByTag(widget.definition.tag, {template, data});
}