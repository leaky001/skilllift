import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  FaShieldAlt, 
  FaUpload, 
  FaFileAlt, 
  FaIdCard, 
  FaHome, 
  FaCamera,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaArrowLeft,
  FaClock,
  FaTimes
} from 'react-icons/fa';
import { showSuccess, showError } from '../../services/toastService.jsx';
import { submitKYC, getKYCStatus } from '../../services/kycService';
import { useAuth } from '../../context/AuthContext';

const KYCSubmission = () => {
  const navigate = useNavigate();
  const { user, getTutorStatus, refreshUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);
  const [kycData, setKycData] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({
    idDocument: null,
    addressDocument: null,
    profilePhoto: null
  });

  // Check KYC status on component mount
  useEffect(() => {
    checkKYCStatus();
  }, []);

  const checkKYCStatus = async () => {
    try {
      // First refresh user profile to get latest data
      await refreshUserProfile();
      
      const response = await getKYCStatus();
      console.log('🔍 KYC Status Response:', response);
      if (response.success) {
        setKycStatus(response.data.kycStatus);
        setKycData(response.data.documents);
        console.log('📄 KYC Documents Data:', response.data.documents);
      }
    } catch (error) {
      console.error('Error checking KYC status:', error);
      // Fallback to user data
      const tutorStatus = getTutorStatus();
      if (tutorStatus === 'kyc_submitted') {
        setKycStatus('submitted');
      } else if (tutorStatus === 'kyc_approved') {
        setKycStatus('approved');
      } else if (tutorStatus === 'kyc_rejected') {
        setKycStatus('rejected');
      } else {
        setKycStatus('pending');
      }
    }
  };

  const validationSchema = Yup.object({
    idDocumentType: Yup.string()
      .required('ID document type is required'),
    addressDocumentType: Yup.string()
      .required('Address document type is required'),
    notes: Yup.string()
      .max(500, 'Notes must be less than 500 characters')
  });

  const formik = useFormik({
    initialValues: {
      idDocumentType: '',
      addressDocumentType: '',
      notes: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      // Check if all required files are uploaded
      if (!uploadedFiles.idDocument) {
        showError('Please upload your ID document');
        return;
      }
      if (!uploadedFiles.addressDocument) {
        showError('Please upload your address document');
        return;
      }
      if (!uploadedFiles.profilePhoto) {
        showError('Please upload your profile photo');
        return;
      }

      setIsLoading(true);
      try {
        const formData = new FormData();
        
        // Add form data
        formData.append('idDocumentType', values.idDocumentType);
        formData.append('addressDocumentType', values.addressDocumentType);
        formData.append('notes', values.notes);
        
        // Add files
        formData.append('idDocument', uploadedFiles.idDocument);
        formData.append('addressDocument', uploadedFiles.addressDocument);
        formData.append('profilePhoto', uploadedFiles.profilePhoto);

        const result = await submitKYC(formData);
        
        if (result.success) {
          showSuccess('✅ KYC documents submitted successfully! You will be notified once reviewed.');
          // Refresh user profile and KYC status
          await refreshUserProfile();
          await checkKYCStatus();
          // Don't navigate away - show the waiting message
        }
      } catch (error) {
        console.error('KYC submission error:', error);
        showError(error.response?.data?.message || 'Failed to submit KYC documents. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  });

  const handleFileUpload = (fileType, file) => {
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        showError('Only JPEG, PNG, and PDF files are allowed');
        return;
      }

      setUploadedFiles(prev => ({
        ...prev,
        [fileType]: file
      }));
    }
  };

  const removeFile = (fileType) => {
    setUploadedFiles(prev => ({
      ...prev,
      [fileType]: null
    }));
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'idDocument': return FaIdCard;
      case 'addressDocument': return FaHome;
      case 'profilePhoto': return FaCamera;
      default: return FaFileAlt;
    }
  };

  const getFileLabel = (fileType) => {
    switch (fileType) {
      case 'idDocument': return 'ID Document';
      case 'addressDocument': return 'Address Document';
      case 'profilePhoto': return 'Profile Photo';
      default: return 'Document';
    }
  };

  const getFileDescription = (fileType) => {
    switch (fileType) {
      case 'idDocument': return 'Upload a clear photo of your government-issued ID';
      case 'addressDocument': return 'Upload a utility bill or bank statement showing your address';
      case 'profilePhoto': return 'Upload a clear photo of yourself';
      default: return 'Upload document';
    }
  };

  const renderFileUpload = (fileType) => {
    const Icon = getFileIcon(fileType);
    const label = getFileLabel(fileType);
    const description = getFileDescription(fileType);
    const file = uploadedFiles[fileType];

    return (
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} *
          </label>
          <p className="text-sm text-gray-500 mb-3">{description}</p>
        </div>

        {file ? (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">{file.name}</p>
                <p className="text-xs text-green-600">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeFile(fileType)}
              className="text-red-600 hover:text-red-800"
            >
              <FaExclamationTriangle className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              id={fileType}
              accept="image/*,.pdf"
              onChange={(e) => handleFileUpload(fileType, e.target.files[0])}
              className="hidden"
            />
            <label
              htmlFor={fileType}
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <FaUpload className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-600">Click to upload {label.toLowerCase()}</span>
              <span className="text-xs text-gray-500">JPEG, PNG, or PDF (max 5MB)</span>
            </label>
          </div>
        )}
      </div>
    );
  };

  // Show loading state while checking KYC status
  if (kycStatus === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking KYC status...</p>
        </div>
      </div>
    );
  }

  // Show different content based on KYC status
  if (kycStatus === 'submitted') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-yellow-100 rounded-full p-4 shadow-lg">
                <FaClock className="text-3xl text-yellow-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              KYC Under Review
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Your documents are being reviewed by our admin team
            </p>
            
            {/* Back Button */}
            <button
              onClick={() => navigate('/tutor/dashboard')}
              className="text-blue-600 hover:text-blue-800 flex items-center justify-center mx-auto"
            >
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </button>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Status Message */}
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                <FaClock className="h-12 w-12 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Please Wait for Admin Review
              </h2>
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                Your KYC documents have been submitted successfully. Our admin team will review them within 24-48 hours. 
                You will receive an email notification once the review is complete.
              </p>
              
              {/* Debug Info (remove in production) */}
              {process.env.NODE_ENV === 'development' && kycData && (
                <div className="mb-4 p-4 bg-gray-100 rounded-lg text-xs">
                  <strong>Debug Info:</strong>
                  <pre>{JSON.stringify(kycData, null, 2)}</pre>
                </div>
              )}

              {/* Submitted Documents Preview */}
              {kycData && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Submitted Documents:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ID Document */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        ID Document ({kycData.idDocumentType || 'Not specified'})
                      </h4>
                      <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {kycData.idDocument ? (
                          <div className="space-y-2">
                            <FaFileAlt className="h-8 w-8 text-blue-600 mx-auto" />
                            <p className="text-sm text-gray-600">✅ Document uploaded successfully</p>
                            <p className="text-xs text-gray-500">
                              {kycData.idDocument.split('/').pop() || 'File uploaded'}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <FaFileAlt className="h-8 w-8 text-gray-400 mx-auto" />
                            <p className="text-sm text-gray-500">Document not available</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Address Document */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Address Document ({kycData.addressDocumentType || 'Not specified'})
                      </h4>
                      <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {kycData.addressDocument ? (
                          <div className="space-y-2">
                            <FaFileAlt className="h-8 w-8 text-blue-600 mx-auto" />
                            <p className="text-sm text-gray-600">✅ Document uploaded successfully</p>
                            <p className="text-xs text-gray-500">
                              {kycData.addressDocument.split('/').pop() || 'File uploaded'}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <FaFileAlt className="h-8 w-8 text-gray-400 mx-auto" />
                            <p className="text-sm text-gray-500">Document not available</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Profile Photo */}
                    <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                      <h4 className="font-medium text-gray-900 mb-2">Profile Photo</h4>
                      <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {kycData.profilePhoto ? (
                          <div className="space-y-2">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                              <FaCamera className="h-6 w-6 text-blue-600" />
                            </div>
                            <p className="text-sm text-gray-600">✅ Photo uploaded successfully</p>
                            <p className="text-xs text-gray-500">
                              {kycData.profilePhoto.split('/').pop() || 'Photo uploaded'}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                              <FaCamera className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500">Photo not available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left max-w-2xl mx-auto">
                  <h3 className="font-semibold text-yellow-900 mb-2">What happens next?</h3>
                  <ul className="text-yellow-800 space-y-1 text-sm">
                    <li>📋 Admin reviews your submitted documents</li>
                    <li>📧 You'll receive an email notification with the result</li>
                    <li>✅ If approved, you can start creating courses</li>
                    <li>❌ If rejected, you can resubmit with corrections</li>
                  </ul>
                </div>
                
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => navigate('/tutor/dashboard')}
                    className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/tutor/courses')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    View Courses
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (kycStatus === 'approved') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 rounded-full p-4 shadow-lg">
                <FaCheckCircle className="text-3xl text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              KYC Approved! 🎉
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Your identity has been verified. You can now create courses!
            </p>
            
            {/* Back Button */}
            <button
              onClick={() => navigate('/tutor/dashboard')}
              className="text-blue-600 hover:text-blue-800 flex items-center justify-center mx-auto"
            >
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </button>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <FaCheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Congratulations! Your KYC is Approved
              </h2>
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                Your identity verification is complete. You now have full access to create courses, 
                live classes, and assignments for learners to enroll in.
              </p>
              
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => navigate('/tutor/courses/create')}
                  className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                  Create Your First Course
                </button>
                <button
                  onClick={() => navigate('/tutor/dashboard')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (kycStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 rounded-full p-4 shadow-lg">
                <FaTimes className="text-3xl text-red-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              KYC Verification Required
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Please resubmit your documents with the required corrections
            </p>
            
            {/* Back Button */}
            <button
              onClick={() => navigate('/tutor/dashboard')}
              className="text-blue-600 hover:text-blue-800 flex items-center justify-center mx-auto"
            >
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </button>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <FaTimes className="h-12 w-12 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                KYC Verification Rejected
              </h2>
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                Your KYC documents were rejected. Please review the feedback and resubmit with the required corrections.
              </p>
              
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => {
                    setKycStatus('pending');
                    // Reset form to allow resubmission
                  }}
                  className="px-8 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                >
                  Resubmit KYC Documents
                </button>
                <button
                  onClick={() => navigate('/tutor/dashboard')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Default: Show KYC submission form (for 'pending' status)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 rounded-full p-4 shadow-lg">
              <FaShieldAlt className="text-3xl text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Complete Your KYC Verification
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Verify your identity to start teaching on SkillLift
          </p>
          
          {/* Back Button */}
          <button
            onClick={() => navigate('/tutor/dashboard')}
            className="text-blue-600 hover:text-blue-800 flex items-center justify-center mx-auto"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Info Box */}
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <FaShieldAlt className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-2">🔒 KYC Verification Required</p>
                <p className="mb-2">
                  To ensure the safety and security of our platform, all tutors must complete 
                  Know Your Customer (KYC) verification before they can create courses or receive payments.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your documents will be reviewed within 24-48 hours</li>
                  <li>You'll receive an email notification once approved</li>
                  <li>All documents are encrypted and stored securely</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-8">
            {/* Document Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ID Document Type */}
              <div>
                <label htmlFor="idDocumentType" className="block text-sm font-medium text-gray-700 mb-2">
                  ID Document Type *
                </label>
                <select
                  id="idDocumentType"
                  name="idDocumentType"
                  value={formik.values.idDocumentType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.idDocumentType && formik.errors.idDocumentType
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                >
                  <option value="">Select ID document type</option>
                  <option value="passport">Passport</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="national_id">National ID</option>
                  <option value="other">Other Government ID</option>
                </select>
                {formik.touched.idDocumentType && formik.errors.idDocumentType && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.idDocumentType}</p>
                )}
              </div>

              {/* Address Document Type */}
              <div>
                <label htmlFor="addressDocumentType" className="block text-sm font-medium text-gray-700 mb-2">
                  Address Document Type *
                </label>
                <select
                  id="addressDocumentType"
                  name="addressDocumentType"
                  value={formik.values.addressDocumentType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.addressDocumentType && formik.errors.addressDocumentType
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                >
                  <option value="">Select address document type</option>
                  <option value="utility_bill">Utility Bill</option>
                  <option value="bank_statement">Bank Statement</option>
                  <option value="government_letter">Government Letter</option>
                  <option value="other">Other Address Proof</option>
                </select>
                {formik.touched.addressDocumentType && formik.errors.addressDocumentType && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.addressDocumentType}</p>
                )}
              </div>
            </div>

            {/* File Uploads */}
            <div className="space-y-8">
              {renderFileUpload('idDocument')}
              {renderFileUpload('addressDocument')}
              {renderFileUpload('profilePhoto')}
            </div>

            {/* Additional Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formik.touched.notes && formik.errors.notes
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
                placeholder="Any additional information you'd like to provide..."
              />
              {formik.touched.notes && formik.errors.notes && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.notes}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin h-4 w-4" />
                    <span>Submitting KYC...</span>
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="h-4 w-4" />
                    <span>Submit KYC Documents</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default KYCSubmission;
