import {
  GraphQLOptions,
  // HttpQueryError,
  runHttpQuery,
  convertNodeHttpToRequest,
} from 'apollo-server-core';
import { ValueOrPromise } from 'apollo-server-types';
import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';

export interface NextGraphQLOptionsFunction {
  (req: NextApiRequest, res: NextApiResponse): ValueOrPromise<GraphQLOptions>;
}

// Design principles:
// - there is just one way allowed: POST request with JSON body. Nothing else.
// - simple, fast and secure
//

export function graphqlNext(
  options: GraphQLOptions | NextGraphQLOptionsFunction
): NextApiHandler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    throw new Error(
      `Apollo Server expects exactly one argument, got ${arguments.length}`
    );
  }

  return async (req, res): Promise<void> => {
    try {
      const { graphqlResponse, responseInit } = await runHttpQuery([req, res], {
        method: req.method,
        options,
        query: req.method === 'POST' ? req.body : req.query,
        request: convertNodeHttpToRequest(req),
      });

      if (responseInit.headers) {
        // eslint-disable-next-line no-restricted-syntax
        for (const [name, value] of Object.entries(responseInit.headers)) {
          res.setHeader(name, value);
        }
      }

      // Using `.send` is a best practice for Express, but we also just use
      // `.end` for compatibility with `connect`.
      if (typeof res.send === 'function') {
        res.send(graphqlResponse);
      } else {
        res.end(graphqlResponse);
      }
    } catch (error) {
      if (error.name !== 'HttpQueryError') {
        throw error;
      }

      if (error.headers) {
        // eslint-disable-next-line no-restricted-syntax
        for (const [name, value] of Object.entries(error.headers)) {
          res.setHeader(name, value as string);
        }
      }

      res.statusCode = error.statusCode;
      if (typeof res.send === 'function') {
        // Using `.send` is a best practice for Express, but we also just use
        // `.end` for compatibility with `connect`.
        res.send(error.message);
      } else {
        res.end(error.message);
      }
    }
  };
}
