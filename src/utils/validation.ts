export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // Indian mobile number validation - 10 digits starting with 6, 7, 8, or 9
  let cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Handle +91 country code (remove if present)
  if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
    cleanPhone = cleanPhone.substring(2);
  }
  
  const indianMobileRegex = /^[6-9]\d{9}$/;
  return indianMobileRegex.test(cleanPhone);
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  let cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Handle +91 country code (remove if present)
  if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
    cleanPhone = cleanPhone.substring(2);
  }
  
  if (cleanPhone.length === 10) {
    // Indian format: +91 98765 43210
    return `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;
  }
  
  return phoneNumber;
};

export const getPhoneNumberError = (phoneNumber: string): string | null => {
  if (!phoneNumber.trim()) {
    return 'Phone number is required';
  }
  
  if (!validatePhoneNumber(phoneNumber)) {
    return 'Please enter a valid Indian mobile number (10 digits starting with 6, 7, 8, or 9)';
  }
  
  return null;
};

export const getNameError = (name: string): string | null => {
  if (!name.trim()) {
    return 'Name is required';
  }
  
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters long';
  }
  
  if (name.trim().length > 50) {
    return 'Name must be less than 50 characters';
  }
  
  return null;
};
