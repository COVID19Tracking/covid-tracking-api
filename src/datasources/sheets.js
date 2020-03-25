const _ = require('lodash/fp')
const {
  setField, setFieldWith,
} = require('prairie')
const {
  addFips, addName, dailyDate,
} = require('./utils')

const sheets = {
  app: 'sheets',
  worksheetId: '18oVRrHj3c183mHmq3m89_163yuYltLNlOmPerQ18E8w',
  key: global.GOOGLE_API_KEY,
}


const addDailyDateChecked = setFieldWith('dateChecked', 'date', dailyDate)
const addTotalResults = setField('totalTestResults', _.flow(_.at(['positive', 'negative']), _.sum))

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
      addDailyDateChecked,
      addTotalResults,
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
}
const usDaily = {
  ...sheets,
  fixItems: fixDaily,
  sheetName: 'US daily 4 pm ET',
}

module.exports = {
  statesDaily,
  statesInfo,
  usDaily,
}
