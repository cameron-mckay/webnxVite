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

async function sendPayloadToChannel(bc, payload) {
  return clients.matchAll()
  .then(async (clientList)=>{
    let focused = clientList.some((client)=>client.focused)
    if(focused || clientList.length > 0) {
      bc.postMessage(payload)
      return true;
    }
    return false
  })
}

async function handlePush(event) {
  // Retrieve the textual payload from event.data (a PushMessageData object).
  // Other formats are supported (ArrayBuffer, Blob, JSON), check out the documentation
  // on https://developer.mozilla.org/en-US/docs/Web/API/PushMessageData.
  const push = event.data ? event.data.json() : {type: "Payload", payload: {}};
  // Default - channel has no listener in app
  let bc = new BroadcastChannel("nx-push")
  // If push is a notification
  if(push.type == "Notification") {
    bc = new BroadcastChannel("nx-notification")
  }
  // If push is a silent payload
  else if(push.type == "Payload") {
    bc = new BroadcastChannel("nx-payload")
  }
  // Send payload and store if the client is visible
  let clientVisible = await sendPayloadToChannel(bc, push.payload)
  bc.close()
  // If client isn't visble and the push is a notification
  if(clientVisible==false&&push.type == "Notification") {
    // Send the notification
    await self.registration.showNotification('WebNX Inventory', {
      body: push.payload.text,
      data: push.payload
    })
  }
  // Return client visibility
  return clientVisible;
}
self.addEventListener('push', (event) => {
  // Keep the service worker alive until the notification is created.
  event.waitUntil(
    // Show a notification with title 'ServiceWorker Cookbook' and use the payload
    // as the body.
    handlePush(event)
  );
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({
      type: "window",
    }).then(async (clientList) => {

      const hadWindowToFocus = clientList.some((client)=>{
        if(client.url === `${self.location.origin}/notifications`){
          client.focus()
          return true
        }
        return false
      })
      if(!hadWindowToFocus)
        return self.clients.openWindow(self.location.origin+
            (
              event.notification.data.link ?
              event.notification.data.link :
              '/notifications'
            )
          )
          .then((client)=>{
            if(client){
              client.focus()
            }
          })
          .catch(()=>{
            return self.registration.showNotification('WebNX Inventory', {
              body: "error opening link",
              data: push.payload
            })
          })
    })
  )
})

workbox.core.clientsClaim();

// The precaching code provided by Workbox.
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
