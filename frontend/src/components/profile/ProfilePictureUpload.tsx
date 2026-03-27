import React, { ChangeEvent } from 'react';
import { styles } from './ProfileStyles';

interface ProfilePictureUploadProps {
  picSrc: string;
  firstName: string;
  onPictureChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  picSrc,
  firstName,
  onPictureChange,
}) => {
  return (
    <div style={styles.avatarSection}>
      {picSrc ? (
        <img src={picSrc} alt="Profile" style={styles.avatar} />
      ) : (
        <div style={styles.avatarFallback}>
          {firstName.charAt(0).toUpperCase()}
        </div>
      )}
      <label style={styles.uploadLabel}>
        Change Photo
        <input
          type="file"
          accept="image/*"
          onChange={onPictureChange}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
};

export default ProfilePictureUpload;
