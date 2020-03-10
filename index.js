const { handleRequest } = require('./response')

const sheets = {
  app: 'sheets',
  worksheetId: '18oVRrHj3c183mHmq3m89_163yuYltLNlOmPerQ18E8w',
  key: '',
}
const redirectMap = new Map([
  ['/', 'http://covidtracking.com'],
  ['/states', { ...sheets, sheetName: 'States current' }],
  ['/states/daily', { ...sheets, sheetName: 'States daily 4 pm ET' }],
  ['/states/info', { ...sheets, sheetName: 'States' }],
  ['/us', { ...sheets, sheetName: 'US current' }],
  ['/us/daily', { ...sheets, sheetName: 'US daily 4 pm ET' }],
  ['/counties', { ...sheets, sheetName: 'Counties' }],
])

function handler(request) {
  try {
    return handleRequest(redirectMap, request)
  } catch (err) {
    // Return the error stack as the response
    return new Response(err.stack || err)
  }
}
addEventListener('fetch', event => {
  event.respondWith(handler(event.request))
})
