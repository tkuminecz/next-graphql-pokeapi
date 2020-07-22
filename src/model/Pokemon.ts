import { ObjectType, Field, Int } from 'type-graphql';
import { Sprites } from './Sprites';
import { StatRef } from './Stat';

@ObjectType()
class PokemonStatRef {
  @Field(() => Int)
  base_stat: number;

  @Field(() => Int)
  effort: number;

  @Field()
  stat: StatRef;
}

@ObjectType()
export class Pokemon {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => Int)
  weight: number;

  @Field(() => Int)
  order: number;

  @Field()
  sprites: Sprites;

  @Field(() => [PokemonStatRef])
  stats: PokemonStatRef[];
}
