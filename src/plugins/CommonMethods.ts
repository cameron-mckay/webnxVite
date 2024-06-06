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
  let boxes = doc.getElementsByClassName(className);
  // Loop through each box
  for (let i = 0; i < boxes.length; i++) {
    // Get current box
    let noteBox = boxes.item(i);
    // If it exists and has inner html
    if (noteBox && noteBox.innerHTML) {
      // Replace html shit
      let text = noteBox.innerHTML.replaceAll(/&amp;/g, "&")
      // Search for regex matches
      // older stricter regex:
      // let matches = text.match(/(https?:\/\/(?:www\.)?[a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))/ig);
      // new regex:
      let matches = text.match(/(https?:\/\/(?:www\.)?[a-zA-Z0-9@:%._\+~#=]{2,256}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))/ig);

      // If there are matches
      if (matches && matches.length > 0) {
        // Loop through each match
        for (let match of matches) {
          text = text.replace(match, `<a href="${match}" target="_blank" class="link">${match}</a>`);
        }
        noteBox.innerHTML = text
      }
    }
  }
}

export function arrayToCSV(arr: any[]) {
  if(arr.length>0) {
    let first = arr[0]
    let keys = [] as string[]
    let values = []
    let csv = ""
    Object.keys(first).forEach((key: string)=>{
      keys.push(key)
    })
    csv = keys.join(",") + "\n"
    for(let obj of arr) {
      values = []
      for(let k of keys) {
        let str = String(obj[k]).replaceAll(",","").replaceAll("\"","")
        if(!isNaN(parseInt(str)))
          values.push(str)
        else
          values.push("\"" + str + "\"")
      }
      csv += values.join(",") + "\n"
    }
    return csv
  }
  return ""
}

export function downloadCSV(filename: string, text: string) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename+".csv");
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
