const yaml = require('js-yaml')

const id = (item) => {
  console.log(item)
  return item
}

function getYaml({ args, multi, url }) {
  return fetch(url, { headers: { Accept: 'text/html' } })
    .then((response) => response.text())
    .then((text) => {
      try {
        if (!multi) return yaml.safeLoad(text, args)
        const items = []
        const addItem = item => items.push(item)
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
