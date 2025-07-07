import { UserProfileState } from '../classes/UserProfileState';
import { DefaulUserProfile } from './User';

export const InitialUserProfileStoreState: UserProfileState = {
  original$: DefaulUserProfile,
  current$: DefaulUserProfile,
  loadingStatus$: 'idle',
};
