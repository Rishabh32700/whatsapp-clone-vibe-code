import { useState, useRef } from 'react';
import { User, RegistrationData } from '../types';
import { formatPhoneNumber, getPhoneNumberError, getNameError } from '../utils/validation';
import { defaultAvatars } from '../data/defaultAvatars';
import apiService from '../services/api';
import { Camera, Upload, Check } from 'lucide-react';

type UserRegistrationProps = {
  onRegistrationComplete: (user: User) => void;
};

const UserRegistration = ({ onRegistrationComplete }: UserRegistrationProps) => {
  const [formData, setFormData] = useState<RegistrationData>({
    phoneNumber: '',
    name: '',
    profileImage: defaultAvatars[0].url
  });
  
  const [errors, setErrors] = useState<{ phoneNumber?: string; name?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('phoneNumber', formatted);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleInputChange('profileImage', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    handleInputChange('profileImage', avatarUrl);
    setShowAvatarSelector(false);
  };

  const validateForm = (): boolean => {
    const phoneError = getPhoneNumberError(formData.phoneNumber);
    const nameError = getNameError(formData.name);
    
    const newErrors: { phoneNumber?: string; name?: string } = {};
    if (phoneError) newErrors.phoneNumber = phoneError;
    if (nameError) newErrors.name = nameError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate session ID for this browser
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Register user via API
      const response = await apiService.registerUser({
        phoneNumber: formData.phoneNumber,
        name: formData.name.trim(),
        profileImage: formData.profileImage,
        sessionId
      });

      // Set token for future API calls
      apiService.setToken(response.token);

      // Save user data to localStorage
      localStorage.setItem('currentUser', JSON.stringify(response.user));

      // Complete registration
      onRegistrationComplete(response.user);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific API errors
      if (error.message?.includes('already exists')) {
        setErrors({ phoneNumber: 'This phone number is already registered' });
      } else if (error.message?.includes('validation')) {
        setErrors({ phoneNumber: 'Please check your phone number format' });
      } else {
        setErrors({ phoneNumber: 'Registration failed. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-whatsapp-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-whatsapp-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-whatsapp-gray-900">Create Your Profile</h1>
          <p className="text-whatsapp-gray-600 mt-2">Set up your WhatsApp account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div className="text-center">
            <div className="relative inline-block">
              <img
                src={formData.profileImage}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-whatsapp-gray-200"
              />
              <button
                type="button"
                onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                className="absolute bottom-0 right-0 bg-whatsapp-green-500 text-white p-2 rounded-full hover:bg-whatsapp-green-600 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-sm text-whatsapp-green-500 hover:text-whatsapp-green-600 flex items-center gap-1 mx-auto"
            >
              <Upload className="w-4 h-4" />
              Upload Photo
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Avatar Selector */}
          {showAvatarSelector && (
            <div className="bg-whatsapp-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-whatsapp-gray-900 mb-3">Choose Default Avatar</h3>
              <div className="grid grid-cols-4 gap-2">
                {defaultAvatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => handleAvatarSelect(avatar.url)}
                    className={`relative p-1 rounded-lg transition-colors ${
                      formData.profileImage === avatar.url ? 'bg-whatsapp-green-100' : 'hover:bg-whatsapp-gray-100'
                    }`}
                  >
                    <img
                      src={avatar.url}
                      alt={avatar.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {formData.profileImage === avatar.url && (
                      <Check className="absolute top-1 right-1 w-4 h-4 text-whatsapp-green-500 bg-white rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-whatsapp-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-green-500 ${
                errors.name ? 'border-red-500' : 'border-whatsapp-gray-300'
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Phone Number Input */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-whatsapp-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handlePhoneNumberChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-green-500 ${
                errors.phoneNumber ? 'border-red-500' : 'border-whatsapp-gray-300'
              }`}
              placeholder="(123) 456-7890"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-whatsapp-green-500 text-white py-3 rounded-lg font-medium hover:bg-whatsapp-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserRegistration;
