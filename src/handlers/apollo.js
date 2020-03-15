const { ApolloServer } = require('apollo-server-cloudflare')
const { graphqlCloudflare } = require('apollo-server-cloudflare/dist/cloudflareApollo')

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
}

module.exports = handler
