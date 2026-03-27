// Profile-related type definitions shared by ProfileCreation and Profile.

export interface ProfileFormData {
  whereHeard: string[];
  otherWhereHeard: string;
  educationCategory: string;
  educationLevel: string;
  otherEducationLevel: string;
  subjects: string[];
  otherSubject: string;
  codingExperience: string;
  favoriteHobbies: string[];
  customHobbies: string;
}

export interface ProfileData {
  name: string;
  profilePicture: string;
  educationCategory: string;
  educationLevel: string;
  otherEducationLevel: string;
  subjectsStudied: string[];
  otherSubject: string;
  codingExperience: string;
  favoriteHobbies: string[];
  customHobbies: string;
  hobbyPersonalization: boolean;
  hasPassword: boolean;
  hasGoogle: boolean;
}
