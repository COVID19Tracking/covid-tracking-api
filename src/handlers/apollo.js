const { ApolloServer } = require('apollo-server-cloudflare')
const { graphqlCloudflare } = require('apollo-server-cloudflare/dist/cloudflareApollo')
const setCors = require('./setCors')
// const KVCache = require('./kv-cache')

const createServer = ({
  dataSources, typeDefs, resolvers,
}) => new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  dataSources,
  // cache: kvCache ? new KVCache() : undefined,
})

const handler = (request, graphQLOptions) => {
  const server = createServer(graphQLOptions)
  return graphqlCloudflare(() => server.createGraphQLServerOptions(request))(request)
    .then(setCors(graphQLOptions.cors || {}))
}

module.exports = handler
