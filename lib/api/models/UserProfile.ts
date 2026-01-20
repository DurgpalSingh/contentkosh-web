import type { User } from './User';
import type { BusinessUser } from './BusinessUser';

export type UserProfile = User & {
    businessUsers?: Array<BusinessUser>;
};
