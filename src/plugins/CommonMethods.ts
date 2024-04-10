export function isMobile() {
  if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return true
  } else {
    return false
  }
}


export function clamp(num: number, min: number, max: number) {
  return num <= min 
    ? min 
    : num >= max 
      ? max 
      : num
}

export function urlBase64ToUint8Array(base64String: string) {
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

export function replaceLinksWithAnchors(doc: Document, className: string) {
  let boxes = doc.getElementsByClassName(className)
  let i = 0
  while(i<boxes.length) {
    let noteBox = boxes.item(i)
    if(noteBox&&noteBox.innerHTML) {
      let matches = noteBox.innerHTML.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g)
      if(matches&&matches.length>0) {
        let new_text = noteBox.innerHTML
        for(let match of matches) {
          console.log(match)
          new_text = new_text.replace(match, `<a href="${match}" target="_blank" class="link">${match}</a>`)
        }
        noteBox.innerHTML = new_text
      }
    }
    i++
  }
}
