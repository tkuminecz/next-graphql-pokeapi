import { NextApiRequest, NextApiResponse } from 'next';
import { ApolloServer, gql } from '~lib/apollo-server-next';

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    hello: String
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const handler = server.getRequestHandler({ baseUrl: '/api/graphql' });

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  return handler(req, res);
};
