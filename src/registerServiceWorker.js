if (import.meta.env.VITE_NODE_ENV == 'production') {
  navigator.serviceWorker.register(`${import.meta.env.VITE_API_URL}/service-worker.js`, {})
    .then((reg)=>{
      console.log('Service worker has been registered.');
      // On update
      reg.onupdatefound = () => {
        console.log('New content is downloading.');

        const installingWorker = registration.installing
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('New content is available; please refresh.');
              window.location.reload()
            } else {
              console.log('Content has been cached for offline use.');
            } 
          }
        }
      }
    })
    .catch((err)=>{
      if (!navigator.onLine) {
        console.log('No internet connection found. App is running in offline mode.')
      }
      console.error(err)
    })

  navigator.serviceWorker.ready
    .then((reg) => {
      return reg.pushManager.getSubscription()
        .then(async (sub)=>{
          if(sub)
            return sub

          const response = await fetch('./api/notifications/publicKey')
          const key = await response.text()

          const convertedKey = urlBase64ToUint8Array(key)
          return registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey
          });
        })
    })
    .then(function(subscription) {
      // Send the subscription details to the server using the Fetch API.
      fetch('./register', {
        method: 'post',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          subscription: subscription
        }),
      });
    })
}

function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
 
  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);
 
  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
