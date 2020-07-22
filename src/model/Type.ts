import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class Type {
  @Field()
  name: string;
}
