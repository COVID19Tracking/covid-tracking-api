const _ = require('lodash/fp')
const { sheetVals } = require('./sheets')

const dataInfo = {
  status: 200,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json;charset=UTF-8',
    'Cache-Control': 'public, max-age=3600',
  },
}

const dataResponse = (res, init = {}) => new Response(JSON.stringify(res), {...dataInfo, ...init})

const handleRequest = (redirectMap, request) => {
  const { url } = request
  const { origin, pathname } = new URL(url)
  const redirectLocation = redirectMap && redirectMap.get(pathname)
  if (!redirectLocation) {
    const res = { error: 'NOT FOUND', pathname }
    return dataResponse(res, { status: 404 })
  }
  if (_.isString(redirectLocation)) {
    // Anything that starts with 'files' will proxy b2.
    if (redirectLocation.startsWith('http')) return Response.redirect(redirectLocation, 302)
    return Response.redirect(`${origin}/${redirectLocation}`, 302)
  }
  if (redirectLocation.app === 'sheets') {
    return sheetVals(redirectLocation).then(dataResponse)
  }
  return fetch(request)
}

module.exports = {
  handleRequest,
}
