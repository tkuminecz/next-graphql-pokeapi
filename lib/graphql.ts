import { Field, ObjectType, ClassType } from 'type-graphql';

export interface IRefEntity {
  url: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Ref = <T extends ClassType<any>>(
  Entity: T
): T & ClassType<IRefEntity> => {
  @ObjectType()
  class RefEntity extends Entity {
    @Field()
    url: string;
  }

  return RefEntity;
};
