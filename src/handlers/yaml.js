const yaml = require('js-yaml')

/* globals fetch */
function getYaml({ args, multi, url }) {
  return fetch(url, { cf: { cacheEverything: true, cacheTtl: 20 }, headers: { Accept: 'text/html' } })
    .then((response) => response.text())
    .then((text) => {
      try {
        if (!multi) return yaml.safeLoad(text, args)
        const items = []
        const addItem = (item) => items.push(item)
        yaml.safeLoadAll(text, addItem, args)
        return items
      } catch (err) {
        return {
          error: true,
          ...err,
        }
      }
    })
}

module.exports = getYaml
