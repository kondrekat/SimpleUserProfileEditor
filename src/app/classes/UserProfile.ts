export interface UserProfile {
  name: string;
  email: string;
  bio: string;
  dateOfBirth: Date;
  themePreference: 'light' | 'dark';
}
