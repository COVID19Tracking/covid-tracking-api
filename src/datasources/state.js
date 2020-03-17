const _ = require('lodash/fp')
const { addHours, formatISO, parse } = require('date-fns/fp')
const { zonedTimeToUtc } = require('date-fns-tz/fp')
const { RESTDataSource } = require('apollo-datasource-rest')
const { createObj, propDo, setFieldWith } = require('prairie')
const { codeByName, nameByCode } = require('./stateNames')

const toDate = _.flow(
  zonedTimeToUtc('America/New_York'),
  addHours(16),
  formatISO,
)

const dailyDate = _.flow(
  parse(new Date(), 'yyyyMMdd'),
  toDate,
)
const totalDate = _.flow(
  parse(new Date(), 'M/dd HH:mm'),
  toDate,
)
const stat = ({
  date, death, positive, negative, pending, total, lastUpdatedEt, checkTimeEt, state,
}) => ({
  state,
  positive,
  negative,
  pending,
  death,
  total,
  dateModified: lastUpdatedEt && totalDate(lastUpdatedEt),
  dateChecked: (checkTimeEt && totalDate(checkTimeEt)) || (date && dailyDate(date)),
})

const resource = ({
  daily, dataSite, notes, pui, pum, tracker, ...rest
}) => ({
  daily: _.map(stat, daily),
  state: rest.state,
  url: dataSite,
  pui,
  pum,
  notes,
  tracker,
  total: stat(rest),
})
const healthDepartment = ({ covid19Site, twitter }) => ({
  twitter,
  url: covid19Site,
})
const stateReducer = _.flow(
  setFieldWith('name', 'state', nameByCode),
  (item) => ({
    id: item.state,
    name: item.name,
    covidResource: resource(item),
    healthDepartment: healthDepartment(item),
  }),
)

const byState = _.keyBy('state')

const statesReducer = ([totals, info, daily, urls]) => _.values(_.mergeAll([
  byState(totals),
  byState(info),
  _.mapValues(createObj('daily'), _.groupBy('state', daily)),
  _.mapValues(createObj('tracker'), _.keyBy(propDo('name', codeByName), _.compact(urls))),
])).map(stateReducer)

class StateAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = 'https://covidtracking.com/api/'
  }

  getAllStates() {
    return Promise.all([
      this.get('states'),
      this.get('states/info'),
      this.get('states/daily'),
      this.get('urls'),
    ])
      .then(statesReducer)
  }

  getStateIndex() { return this.getAllStates().then(_.keyBy('id')) }

  getStateById({ id }) { return this.getStateIndex().then(_.get(id)) }

  getStateByIds({ ids }) { return this.getStateIndex().then(_.at(ids)) }
}

module.exports = StateAPI
