import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Sprites {
  @Field()
  front_default: string;
}
