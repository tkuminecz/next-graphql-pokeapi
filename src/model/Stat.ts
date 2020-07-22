import { ObjectType, Field } from 'type-graphql';
import { Ref } from '~lib/graphql';

@ObjectType()
export class Stat {
  @Field()
  name: string;
}

@ObjectType()
export class StatRef extends Ref(Stat) {}
