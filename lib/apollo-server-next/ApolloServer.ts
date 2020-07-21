import corsMiddleware from 'cors';
import { OptionsJson } from 'body-parser';
import {
  renderPlaygroundPage,
  RenderPageOptions as PlaygroundRenderPageOptions,
} from '@apollographql/graphql-playground-html';
import {
  GraphQLOptions,
  FileUploadOptions,
  ApolloServerBase,
  formatApolloErrors,
  processFileUploads,
  ContextFunction,
  Context,
  Config,
  ApolloError,
} from 'apollo-server-core';
// import { ExecutionParams } from 'subscriptions-transport-ws';
import accepts from 'accepts';
import typeis from 'type-is';
import { NextApiHandler, NextApiResponse, NextApiRequest } from 'next';
import { graphqlNext } from './nextApollo';

export type { GraphQLOptions, GraphQLExtension } from 'apollo-server-core';

type MiddlewareFn<T> = (
  req: NextApiRequest,
  res: NextApiResponse,
  cb: (val: Error | T) => void
) => void | Promise<T>;

const applyMiddleware = <T>(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: MiddlewareFn<T>
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const cb = result => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    };
    const result = fn(req, res, cb);
    if (result && typeof result.then === 'function') {
      result.then(resolve).catch(reject);
    }
  });
};

export interface GetRequestHandlerOptions {
  cors?:
    | corsMiddleware.CorsOptions
    | corsMiddleware.CorsOptionsDelegate
    | boolean;
  bodyParserConfig?: OptionsJson | boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onHealthCheck?: (req: NextApiRequest) => Promise<any>;
  disableHealthCheck?: boolean;
  baseUrl?: string;
}

// export interface ServerRegistration extends GetRequestHandlerOptions {
//   // Note: You can also pass a connect.Server here. If we changed this field to
//   // `express.Application | connect.Server`, it would be very hard to get the
//   // app.use calls to typecheck even though they do work properly. Our
//   // assumption is that very few people use connect with TypeScript (and in fact
//   // we suspect the only connect users left writing GraphQL apps are Meteor
//   // users).
//   app: express.Application;
// }

const createFileUploadMiddleware = (
  uploadsConfig: FileUploadOptions,
  server: ApolloServerBase
): MiddlewareFn<void | ApolloError[]> => async (req, res) => {
  // Note: we use typeis directly instead of via req.is for connect support.
  if (
    typeof processFileUploads === 'function' &&
    typeis(req, ['multipart/form-data'])
  ) {
    return processFileUploads(req, res, uploadsConfig)
      .then(body => {
        req.body = body;
      })
      .catch(error => {
        if (error.status && error.expose) res.status(error.status);

        return formatApolloErrors([error], {
          formatter: server.requestOptions.formatError,
          debug: server.requestOptions.debug,
        });
      });
  }
  return undefined;
};

export interface ApolloServerNextConfig extends Config {
  context?: ContextFunction<unknown, Context> | Context;
}

export class ApolloServer extends ApolloServerBase {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(config: ApolloServerNextConfig) {
    super(config);
  }

  // This translates the arguments from the middleware into graphQL options It
  // provides typings for the integration specific behavior, ideally this would
  // be propagated with a generic to the super class
  async createGraphQLServerOptions(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ req, res });
  }

  protected supportsSubscriptions(): boolean {
    return true;
  }

  protected supportsUploads(): boolean {
    return true;
  }

  private async healthCheck(
    req: NextApiRequest,
    res: NextApiResponse,
    onHealthCheck
  ): Promise<void> {
    // Response follows https://tools.ietf.org/html/draft-inadarei-api-health-check-01
    res.setHeader('Content-Type', 'application/health+json');

    if (onHealthCheck) {
      onHealthCheck(req)
        .then(() => {
          res.json({ status: 'pass' });
        })
        .catch(() => {
          res.status(503).json({ status: 'fail' });
        });
    } else {
      res.json({ status: 'pass' });
    }
  }

  public getRequestHandler({
    cors,
    // bodyParserConfig,
    disableHealthCheck,
    onHealthCheck,
    baseUrl = '',
  }: GetRequestHandlerOptions = {}): NextApiHandler {
    return async (req, res) => {
      const requestPath = req.url.substr(baseUrl.length);

      // Despite the fact that this `applyMiddleware` function is `async` in
      // other integrations (e.g. Hapi), currently it is not for Express (@here).
      // That should change in a future version, but that would be a breaking
      // change right now (see comment above this method's declaration above).
      //
      // That said, we do need to await the `willStart` lifecycle event which
      // can perform work prior to serving a request.  Since Express doesn't
      // natively support Promises yet, we'll do this via a middleware that
      // calls `next` when the `willStart` finishes.  We'll kick off the
      // `willStart` right away, so hopefully it'll finish before the first
      // request comes in, but we won't call `next` on this middleware until it
      // does. (And we'll take care to surface any errors via the `.catch`-able.)
      await this.willStart();

      if (!disableHealthCheck) {
        // router.use('/.well-known/apollo/server-health', (req, res) => {});
        if (requestPath === '/.well-known/apollo/server-health') {
          return this.healthCheck(req, res, onHealthCheck);
        }
      }

      let uploadsMiddleware: MiddlewareFn<void | ApolloError[]>;
      if (this.uploadsConfig && typeof processFileUploads === 'function') {
        uploadsMiddleware = createFileUploadMiddleware(
          this.uploadsConfig,
          this
        );
      }

      // XXX multiple paths?
      this.graphqlPath = baseUrl;

      // Note that we don't just pass all of these handlers to a single app.use call
      // for 'connect' compatibility.
      if (cors === true) {
        await applyMiddleware(req, res, corsMiddleware());
      } else if (cors !== false) {
        await applyMiddleware(req, res, corsMiddleware(cors));
      }

      // @TODO: handle bodyparser config a different way for Next.js api routes
      // if (bodyParserConfig === true) {
      //   router.use(path, json());
      // } else if (bodyParserConfig !== false) {
      //   router.use(path, json(bodyParserConfig));
      // }

      if (uploadsMiddleware) {
        await applyMiddleware(req, res, uploadsMiddleware);
      }

      // Note: if you enable playground in production and expect to be able to see your
      // schema, you'll need to manually specify `introspection: true` in the
      // ApolloServer constructor; by default, the introspection query is only
      // enabled in dev.
      if (this.playgroundOptions && req.method === 'GET') {
        // perform more expensive content-type check only if necessary
        // XXX We could potentially move this logic into the GuiOptions lambda,
        // but I don't think it needs any overriding
        const accept = accepts(req);
        const types = accept.types() as string[];
        const prefersHTML =
          types.find(
            (x: string) => x === 'text/html' || x === 'application/json'
          ) === 'text/html';

        if (prefersHTML) {
          const playgroundRenderPageOptions: PlaygroundRenderPageOptions = {
            endpoint: req.url,
            subscriptionEndpoint: this.subscriptionsPath,
            ...this.playgroundOptions,
          };
          res.setHeader('Content-Type', 'text/html');
          const playground = renderPlaygroundPage(playgroundRenderPageOptions);
          res.write(playground);
          res.end();
          return undefined;
        }
      }

      const handle = graphqlNext(() =>
        this.createGraphQLServerOptions(req, res)
      );

      return handle(req, res);
    };
  }
}
