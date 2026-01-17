import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { set } from 'idb-keyval'

self.skipWaiting()
clientsClaim()

precacheAndRoute(self.__WB_MANIFEST)

cleanupOutdatedCaches()

// Handle Share Target POST request
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url)

    if (event.request.method === 'POST' && url.pathname === '/share-target') {
        event.respondWith(
            (async () => {
                try {
                    const formData = await event.request.formData()
                    const file = formData.get('file')

                    if (file) {
                        // Store the file in IndexedDB using idb-keyval
                        // We use a specific key 'shared-file'
                        await set('shared-file', file)
                        console.log('File stored from share target:', file.name)
                    }

                    // Redirect to root with a query param to trigger handling
                    return Response.redirect('/?shared_action=true', 303)
                } catch (error) {
                    console.error('Share target error:', error)
                    return Response.redirect('/?error=share_failed', 303)
                }
            })()
        )
    }
})
