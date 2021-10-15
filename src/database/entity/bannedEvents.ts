import {
  Field, ID, ObjectType,
} from 'type-graphql';
import { EntitySchema } from 'typeorm';

@ObjectType()
class BannedEventsEventData {
  @Field()
  'broadcaster_id': string;
  @Field()
  'broadcaster_login': string;
  @Field()
  'broadcaster_name': string;
  @Field()
  'user_id': string;
  @Field()
  'user_login': string;
  @Field()
  'user_name': string;
  @Field()
  'expires_at': string;
  @Field()
  'reason': string;
  @Field()
  'moderator_id': string;
  @Field()
  'moderator_login': string;
  @Field()
  'moderator_name': string;
}
@ObjectType()
export class BannedEventsInterface {
  @Field(type => ID)
  'id': string;
  @Field()
  'event_type': 'moderation.user.ban' | 'moderation.user.unban';
  @Field()
  'event_timestamp': string;
  @Field()
  'version': '1.0';
  @Field(type => BannedEventsEventData)
  'event_data': BannedEventsEventData;
}

export const BannedEventsTable = new EntitySchema<BannedEventsInterface>({
  name:    'bannedEvents',
  columns: {
    id: {
      type:    String,
      primary: true,
    },
    event_type:      { type: String },
    event_timestamp: { type: String },
    version:         { type: String },
    event_data:      { type: 'simple-json' },
  },
});