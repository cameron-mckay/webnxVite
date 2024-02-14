if (import.meta.env.VITE_NODE_ENV == 'production') {
  navigator.serviceWorker.register(`${import.meta.env.VITE_API_URL}/service-worker.js`, {})
    .then((reg)=>{
      console.log('Service worker has been registered.');
      console.log("new service worker biatch")
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
}
