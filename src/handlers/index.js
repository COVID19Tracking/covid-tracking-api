const _ = require('lodash/fp')
const { sheetVals } = require('./sheets')
const { dataResponse, handleResponse } = require('./responses')
const apollo = require('./apollo')
const playground = require('./playground')
const getYaml = require('./yaml')

/* globals fetch Response */

const handleRequest = (redirectMap, request) => {
  if (request.method === 'OPTIONS') return new Response('', { status: 204 })
  const { url } = request
  const { origin, pathname } = new URL(url)
  const [path, ext] = pathname.split('.')
  const route = redirectMap && redirectMap.get(path)
  if (!route) {
    const res = { code: 404, error: '404 - NOT FOUND', pathname }
    return dataResponse(res, { status: 404 })
  }
  if (_.isString(route)) {
    // Anything that starts with 'files' will proxy b2.
    if (route.startsWith('http')) return Response.redirect(route, 302)
    return Response.redirect(`${origin}/${route}`, 302)
  }
  const args = {
    ext, origin, pathname, path,
  }
  const { app } = route

  if (app === 'apollo') return apollo(request, route)
  if (app === 'playground') return playground(route)
  if (app === 'yaml') return getYaml(route).then(handleResponse(args))
  if (app === 'yaml') return getYaml(route).then(handleResponse(args))
  if (app === 'sheets') return sheetVals(route).then(handleResponse(args))

  return fetch(request)
}

module.exports = handleRequest
