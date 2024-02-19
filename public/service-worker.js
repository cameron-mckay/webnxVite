/* eslint-disable no-undef, no-restricted-globals */
importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js'
);
// This is the code piece that GenerateSW mode can't provide for us.
// This code listens for the user's confirmation to update the app.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

async function notifyIfInvisible(event) {
  // Retrieve the textual payload from event.data (a PushMessageData object).
  // Other formats are supported (ArrayBuffer, Blob, JSON), check out the documentation
  // on https://developer.mozilla.org/en-US/docs/Web/API/PushMessageData.
  const payload = event.data ? event.data.json() : {text: "", type: "Info", date: new Date()};
  const windowClients = await clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  for (var i = 0; i < windowClients.length; i++) {
    if (windowClients[i].visibilityState === "visible") {
      const bc = new BroadcastChannel("nx-push")
      bc.postMessage(payload)
      bc.close()
      return true;
    }
  }
  await self.registration.showNotification('WebNX Inventory', {
    body: payload.text,
  })
  return false;
}
self.addEventListener('push', (event) => {
  // Keep the service worker alive until the notification is created.
  event.waitUntil(
    // Show a notification with title 'ServiceWorker Cookbook' and use the payload
    // as the body.
    notifyIfInvisible(event)
  );
})

workbox.core.clientsClaim();

// The precaching code provided by Workbox.
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
