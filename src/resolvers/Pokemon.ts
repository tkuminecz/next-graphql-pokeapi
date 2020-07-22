import { Query, Resolver, Arg } from 'type-graphql';
import Pokedex from 'promisemon';
import { Pokemon } from '~/model/Pokemon';

const pokedex = new Pokedex();

@Resolver(() => Pokemon)
export class PokemonResolver {
  @Query(() => Pokemon)
  async pokemon(@Arg('name') name: string): Promise<Pokemon> {
    const json = await pokedex.getPokemon(name);
    const entity = json && JSON.parse(json);
    return entity;
  }
}
