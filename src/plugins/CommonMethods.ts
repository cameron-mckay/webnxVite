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
  // Get the text boxes
  let boxes = doc.getElementsByClassName(className)
  // Create and index
  let i = 0
  // While index less than length
  while(i<boxes.length) {
    // Get current box
    let noteBox = boxes.item(i)
    // If it exists and has inner html
    if(noteBox&&noteBox.innerHTML) {
      // Search for regex matches
      let matches = noteBox.innerHTML.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g)
      // If there are matches
      if(matches&&matches.length>0) {
        // Copy the text to new var
        let new_text = noteBox.innerHTML
        // For each of the matches
        for(let match of matches) {
          // Replace the match with a link
          new_text = new_text.replace(match, `<a href="${match}" target="_blank" class="link">${match}</a>`)
        }
        // Update the html
        noteBox.innerHTML = new_text
      }
    }
    // Increment the index
    i++
  }
}
