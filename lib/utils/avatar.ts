/**
 * Helper function to get the name initials for a user avatar.
 */

const getInitialsFromName = (name?: string) => {
  if (!name) return 'U';

  const trimmedName = name.trim();
  if (!trimmedName) return 'U';

  const nameParts = trimmedName.split(' ');

  if (nameParts.length === 1) {
    const firstPart = nameParts[0];
    if (!firstPart) return 'U';
    return firstPart.substring(0, 2).toUpperCase();
  }

  const firstNameInitial = nameParts[0]?.charAt(0)?.toUpperCase() || '';
  const lastNameInitial = nameParts[nameParts.length - 1]?.charAt(0)?.toUpperCase() || '';

  return (firstNameInitial + lastNameInitial) || 'U';
};

export { getInitialsFromName };