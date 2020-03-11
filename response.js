const _ = require('lodash/fp')
const jsonexport = require('jsonexport')
const { sheetVals } = require('./sheets')

const resInit = _.defaultsDeep({
  status: 200,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json;charset=UTF-8',
    'Cache-Control': 'public, max-age=3600',
  },
})

const dataResponse = (res, init = {}) => new Response(JSON.stringify(res), resInit(init))
const csvResponse = (res, pathname) => new Response(res, resInit({
  headers: {
    'Content-Type': 'text/csv;charset=UTF-8',
    'Content-Disposition': `filename=${pathname.substr(1).replace(/\//g, '-')}`,
  }
}))

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
  if (redirectLocation.app === 'sheets') {
    function sheetResponse(res) {
      if (ext === 'csv') {
        return new Promise((resolve, reject) => {
          jsonexport(res, (err, csv) => {
            if (err) return resolve(new Response(err.stack || err))
            return resolve(csvResponse(csv, pathname))
          })
        })
      }
      // txt or html could be added.
      return dataResponse(res)
    }
    return sheetVals(redirectLocation).then(sheetResponse)
  }
  return fetch(request)
}

module.exports = {
  handleRequest,
}
