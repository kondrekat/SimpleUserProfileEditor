import { LoadingStatus } from '../const/LoadingStatus';
import { UserProfile } from './UserProfile';

export interface UserProfileState {
  original$: UserProfile;
  current$: UserProfile;
  loadingStatus$: LoadingStatus;
}
