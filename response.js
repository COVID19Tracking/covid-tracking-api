const _ = require('lodash/fp')
const { sheetVals } = require('./sheets')
const { dataResponse, handleResponse } = require('./responses')
const getYaml = require('./yaml')

const handleRequest = (redirectMap, request) => {
  const { url } = request
  const { origin, pathname } = new URL(url)
  const [path, ext] = pathname.split('.')
  const redirectLocation = redirectMap && redirectMap.get(path)
  if (!redirectLocation) {
    const res = { error: 'NOT FOUND', pathname }
    return dataResponse(res, { status: 404 })
  }
  if (_.isString(redirectLocation)) {
    // Anything that starts with 'files' will proxy b2.
    if (redirectLocation.startsWith('http')) return Response.redirect(redirectLocation, 302)
    return Response.redirect(`${origin}/${redirectLocation}`, 302)
  }
  const args = { ext, origin, pathname, path }
  if (_.isFunction(redirectLocation)) return redirectLocation(args)
  if (redirectLocation.app === 'yaml') {
    return getYaml(redirectLocation).then(handleResponse(args))
  }
  if (redirectLocation.app === 'sheets') {
    return sheetVals(redirectLocation).then(handleResponse(args))
  }
  return fetch(request)
}

module.exports = {
  handleRequest,
}
