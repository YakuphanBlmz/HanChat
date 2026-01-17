import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { registerRoute } from 'workbox-routing'
import { set } from 'idb-keyval'

self.skipWaiting()
clientsClaim()

precacheAndRoute(self.__WB_MANIFEST)

cleanupOutdatedCaches()

// Handle Share Target POST request using Workbox Router
registerRoute(
    ({ url, request }) => url.pathname === '/share-target' && request.method === 'POST',
    async ({ event }) => {
        const formData = await event.request.formData()
        const file = formData.get('file')

        if (file) {
            await set('shared-file', file)
            console.log('File stored from share target:', file.name)
        }

        return Response.redirect('/?shared_action=true', 303)
    },
    'POST'
)
