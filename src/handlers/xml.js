const _ = require('lodash/fp')
const xml2js = require('xml2js')

/* globals fetch */

function getXml({ handleResult, url }) {
  const parser = new xml2js.Parser({
    explicitArray: false,
    explicitRoot: false,
    ignoreAttrs: true,
    mergeAttrs: true,
    tagNameProcessors: [_.camelCase],
  })
  // console.log(url)
  return fetch(url, { cf: { cacheTtl: 300 }, headers: { Accept: 'text/xml' } })
    .then((response) => response.text())
    // .then((x) => console.log(x) || x)
    .then(parser.parseStringPromise)
    .then((x) => (_.isFunction(handleResult) ? handleResult(x) : x))
}

module.exports = getXml
