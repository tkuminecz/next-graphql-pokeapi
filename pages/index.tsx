import React from 'react';
import Link from 'next/link';

const Landing: React.FC = () => {
  return (
    <>
      <p>next-graphql-pokeapi</p>
      <p>
        <Link href="/api/graphql" passHref>
          <a>GraphQL Playground</a>
        </Link>
      </p>
    </>
  );
};

export default Landing;
