import { NextApiRequest, NextApiResponse } from 'next';
import graphqlServer from '~/graphql';

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const graphql = await graphqlServer;
  return graphql.handleRequest(req, res);
};
