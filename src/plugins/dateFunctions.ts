/**
 *
 *  This file is intended to be used to convert HTML/Javascript dates
 *  while preserving the timezone offset on epochs
 * 
 *  The server uses UTC time to store database records, so timezone
 *  offsets must be used to provide correct results when working with
 *  date ranges
 *
 *  Coding with dates/time is always a hassle so hopefully this will
 *  make it a bit easier
 *
*/

// Returns HTML date string from date object
export function dateToHTML(d: Date) {
  return d.toISOString().replace(/T.*/,'').split('-').join('-')
}

// Converts html date string to date object
export function HTMLToDate(d: string) {
  let returnV = new Date(new Date(d).toLocaleDateString())
  returnV.setDate(returnV.getDate()+1)
  return returnV 
}

// Get todays date with timezone offet
export function getTodaysDate() {
  // Remove hours/minutes from todays date and add timezone offset
  return new Date((new Date()).toLocaleDateString())
}

// Converts HTML date string into UNIX time
export function HTMLtoEpoch(d: string) {
  // getTime returns epoch
  return HTMLToDate(d).getTime()
}

// Returns a date object with time zone offset for last weeks date
export function getLastWeek() {
  let todaysDate = getTodaysDate()
  return new Date(todaysDate.setDate(todaysDate.getDate()-7))
}

// Returns a date object with time zone offset for last months date
export function getLastMonth() {
  let todaysDate = getTodaysDate()
  return new Date(todaysDate.setMonth(todaysDate.getMonth()-1))
}
