import { NextApiRequest, NextApiResponse } from 'next';
import graphqlServer from '~/graphql';

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const grahql = await graphqlServer;
  return grahql.handleRequest(req, res);
};
