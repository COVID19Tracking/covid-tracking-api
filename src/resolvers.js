const { GraphQLJSONObject } = require('graphql-type-json')

module.exports = {
  JSONObject: GraphQLJSONObject,
  Query: {
    states: (parent, args, { dataSources }) => {
      if (args.ids) {
        return dataSources.stateAPI.getStateByIds(args)
      }
      return dataSources.stateAPI.getAllStates()
    },
    state: (parent, args, { dataSources }) => dataSources.stateAPI.getStateById(args),
    usCumulativeTotal: (parent, args, { dataSources }) => dataSources.stateAPI.getUsTotal(),
    usDailyData: (parent, args, { dataSources }) => dataSources.stateAPI.getUsDaily(),
  },
}
