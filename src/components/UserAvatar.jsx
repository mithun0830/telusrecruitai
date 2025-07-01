import React from 'react';

const UserAvatar = ({ name, size = 32 }) => {
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size * 0.4}px`
      }}
    >
      {initials}
    </div>
  );
};

export default UserAvatar;
