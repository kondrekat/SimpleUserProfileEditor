import { UserProfile } from '../classes/UserProfile';

export const DefaulUserProfile: UserProfile = {
  name: 'User',
  email: 'user@mail.com',
  bio: '',
  dateOfBirth: new Date('1990-01-01'),
  themePreference: 'light',
};
