export {
  GraphQLUpload,
  GraphQLExtension,
  // Errors,
  gql,
  toApolloError,
  SyntaxError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  UserInputError,
  // playground
  defaultPlaygroundOptions,
} from 'apollo-server-core';

export type {
  Config,
  ApolloError,
  GraphQLOptions,
  PlaygroundConfig,
  PlaygroundRenderPageOptions,
} from 'apollo-server-core';

export * from 'graphql-tools';
export * from 'graphql-subscriptions';

// ApolloServer integration.
export {
  ApolloServer, // ServerRegistration,
} from './ApolloServer';

export type { ApolloServerNextConfig } from './ApolloServer';

export { CorsOptions } from 'cors';
export type { OptionsJson } from 'body-parser';
