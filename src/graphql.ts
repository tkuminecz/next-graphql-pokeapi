import 'reflect-metadata';
import { buildSchema, ClassType, NonEmptyArray } from 'type-graphql';
import { ApolloServer } from '@tkuminecz/apollo-server-next';
import * as resolvers from '~/resolvers';

const bootstrap = async () => {
  const schema = await buildSchema({
    resolvers: Object.values(resolvers) as NonEmptyArray<
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ClassType<any>
    >,
  });
  const server = new ApolloServer({ schema });
  const handleRequest = server.getRequestHandler({ baseUrl: '/api/graphql' });
  return { handleRequest };
};

export default bootstrap();
