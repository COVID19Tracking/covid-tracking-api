const _ = require('lodash/fp')
const {
  setField, setFieldWith,
} = require('prairie')
const hash = require('object-hash')
const {
  addFips, addName, dailyDate,
} = require('./utils')

const sheets = {
  app: 'sheets',
  worksheetId: '18oVRrHj3c183mHmq3m89_163yuYltLNlOmPerQ18E8w',
  sheetName: 'Sheet1',
  key: global.GOOGLE_API_KEY,
  ttl: 300,
}

const addDailyDateChecked = setFieldWith('dateChecked', 'date', dailyDate)
const sumFields = (fields) => _.flow(_.at(fields), _.sum)
const addTotalResults = setField('totalTestResults', sumFields(['positive', 'negative']))
const addOldTotal = setField('total', sumFields(['positive', 'negative', 'pending']))
const addHash = setField('hash', hash)

const newVals = {
  deathIncrease: null,
  hospitalizedIncrease: null,
  negativeIncrease: null,
  positiveIncrease: null,
  totalTestResultsIncrease: null,
}
function getIncrease(now, prev, fieldId) {
  if (!now[fieldId]) return 0
  const prevVal = prev[fieldId] || 0
  return now[fieldId] - prevVal
}
function getNewVals(now, prev) {
  if (!prev) return newVals
  return {
    deathIncrease: getIncrease(now, prev, 'death'),
    hospitalizedIncrease: getIncrease(now, prev, 'hospitalized'),
    negativeIncrease: getIncrease(now, prev, 'negative'),
    positiveIncrease: getIncrease(now, prev, 'positive'),
    totalTestResultsIncrease: getIncrease(now, prev, 'totalTestResults'),
  }
}

function fixDaily(items) {
  let previous = null
  return _.flow(
    _.orderBy(['date'], ['asc']),
    _.map(_.flow(
      addHash,
      addDailyDateChecked,
      addTotalResults,
      addOldTotal,
      addFips,
      (item) => {
        const increases = getNewVals(item, previous)
        previous = item
        return { ...item, ...increases }
      },
    )),
    _.orderBy(['date'], ['desc']),
  )(items)
}
const fixStatesInfo = _.map(_.flow(
  addFips,
  addName,
))

const statesDaily = {
  ...sheets,
  fixItems: _.flow(
    _.groupBy('state'),
    _.flatMap(fixDaily),
    _.orderBy(['date', 'state'], ['desc', 'asc']),
  ),
  sheetName: 'States daily 4 pm ET',
}
const statesInfo = {
  ...sheets,
  fixItems: fixStatesInfo,
  sheetName: 'States',
  ttl: 900, // 15 minutes
}
const usDaily = {
  ...sheets,
  fixItems: fixDaily,
  sheetName: 'US daily 4 pm ET',
}
const cdcTests = {
  ...sheets,
  worksheetId: '16gBHQ7dCJK1psqEMasmLKiFlzoNKcfNujVpmHLHldSY',
}
const press = {
  ...sheets,
  worksheetId: '1-lvGZ3NgVlda4EcF5t_AVFLnBqz-TOl4YZxYH_mJF_4',
  fixItems: _.orderBy(['publishDate'], ['desc']),
  ttl: 180, // 3 minutes.
}
const fixUsCurrent = _.flow(
  _.set('notes', 'Please stop using the "total" and "posNeg" fields. Use "totalTestResults" instead.'),
  addTotalResults,
  addOldTotal,
)

// lastIncrementalUpdate

function fixUsCurrentItems(newValues, oldVals) {
  const newHash = hash(newValues[0])
  const oldHash = oldVals && oldVals[0].hash
  if (oldHash !== newHash) {
    return [fixUsCurrent({ ...newValues[0], hash: newHash, lastModified: new Date() })]
  }
  return oldVals
}

const usCurrent = {
  ...sheets,
  sheetName: 'US current',
  fixItems: fixUsCurrentItems,
}
module.exports = {
  addOldTotal,
  addTotalResults,
  cdcTests,
  press,
  sheets,
  statesDaily,
  statesInfo,
  usCurrent,
  usDaily,
}
