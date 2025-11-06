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
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {label} *
          </label>
          <p className="text-sm text-slate-600 mb-3">{description}</p>
        </div>

        {file ? (
          <div className="flex items-center justify-between p-4 bg-gradient-to-br from-secondary-50 to-secondary-100 border border-secondary-200 rounded-xl shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-secondary-200 rounded-lg">
                <Icon className="h-5 w-5 text-secondary-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary-800">{file.name}</p>
                <p className="text-xs text-secondary-600">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeFile(fileType)}
              className="text-error-600 hover:text-error-700 p-2 hover:bg-error-50 rounded-lg transition-colors"
            >
              <FaExclamationTriangle className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors bg-slate-50 hover:bg-primary-50/30">
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
              <div className="p-3 bg-primary-100 rounded-full">
                <FaUpload className="h-6 w-6 text-primary-600" />
              </div>
              <span className="text-sm text-slate-700 font-medium">Click to upload {label.toLowerCase()}</span>
              <span className="text-xs text-slate-500">JPEG, PNG, or PDF (max 5MB)</span>
            </label>
          </div>
        )}
      </div>
    );
  };

  // Show loading state while checking KYC status
  if (kycStatus === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-md p-8 border border-slate-100">
          <FaSpinner className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" />
          <p className="text-slate-600 text-lg font-medium">Checking KYC status...</p>
        </div>
      </div>
    );
  }

  // Show different content based on KYC status
  if (kycStatus === 'submitted') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-accent-100 to-accent-200 rounded-full p-5 shadow-lg border border-accent-200">
                <FaClock className="text-4xl text-accent-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              KYC Under Review
            </h1>
            <p className="text-xl text-slate-600 mb-6">
              Your documents are being reviewed by our admin team
            </p>
            
            {/* Back Button */}
            <button
              onClick={() => navigate('/tutor/dashboard')}
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </button>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-xl p-8 border border-slate-100">
            {/* Status Message */}
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center mb-6 shadow-lg border border-accent-200">
                <FaClock className="h-12 w-12 text-accent-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Please Wait for Admin Review
              </h2>
              <p className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto leading-relaxed">
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
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Submitted Documents:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ID Document */}
                    <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <h4 className="font-semibold text-slate-900 mb-3">
                        ID Document ({kycData.idDocumentType || 'Not specified'})
                      </h4>
                      <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors">
                        {kycData.idDocument ? (
                          <div className="space-y-2">
                            <div className="p-3 bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                              <FaFileAlt className="h-8 w-8 text-primary-600" />
                            </div>
                            <p className="text-sm text-slate-700 font-medium">✅ Document uploaded successfully</p>
                            <p className="text-xs text-slate-500">
                              {kycData.idDocument.split('/').pop() || 'File uploaded'}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <FaFileAlt className="h-8 w-8 text-slate-400 mx-auto" />
                            <p className="text-sm text-slate-500">Document not available</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Address Document */}
                    <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <h4 className="font-semibold text-slate-900 mb-3">
                        Address Document ({kycData.addressDocumentType || 'Not specified'})
                      </h4>
                      <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors">
                        {kycData.addressDocument ? (
                          <div className="space-y-2">
                            <div className="p-3 bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                              <FaFileAlt className="h-8 w-8 text-primary-600" />
                            </div>
                            <p className="text-sm text-slate-700 font-medium">✅ Document uploaded successfully</p>
                            <p className="text-xs text-slate-500">
                              {kycData.addressDocument.split('/').pop() || 'File uploaded'}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <FaFileAlt className="h-8 w-8 text-slate-400 mx-auto" />
                            <p className="text-sm text-slate-500">Document not available</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Profile Photo */}
                    <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-5 border border-slate-200 shadow-sm md:col-span-2">
                      <h4 className="font-semibold text-slate-900 mb-3">Profile Photo</h4>
                      <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors">
                        {kycData.profilePhoto ? (
                          <div className="space-y-2">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto shadow-md">
                              <FaCamera className="h-8 w-8 text-primary-600" />
                            </div>
                            <p className="text-sm text-slate-700 font-medium">✅ Photo uploaded successfully</p>
                            <p className="text-xs text-slate-500">
                              {kycData.profilePhoto.split('/').pop() || 'Photo uploaded'}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                              <FaCamera className="h-8 w-8 text-slate-400" />
                            </div>
                            <p className="text-sm text-slate-500">Photo not available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-accent-50 to-accent-100 border border-accent-200 rounded-xl p-5 text-left max-w-2xl mx-auto shadow-sm">
                  <h3 className="font-bold text-accent-900 mb-3">What happens next?</h3>
                  <ul className="text-accent-800 space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="mr-2">📋</span>
                      <span>Admin reviews your submitted documents</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">📧</span>
                      <span>You'll receive an email notification with the result</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">✅</span>
                      <span>If approved, you can start creating courses</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">❌</span>
                      <span>If rejected, you can resubmit with corrections</span>
                    </li>
                  </ul>
                </div>
                
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => navigate('/tutor/dashboard')}
                    className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/tutor/courses')}
                    className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-full p-5 shadow-lg border border-secondary-200">
                <FaCheckCircle className="text-4xl text-secondary-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              KYC Approved! 🎉
            </h1>
            <p className="text-xl text-slate-600 mb-6">
              Your identity has been verified. You can now create courses!
            </p>
            
            {/* Back Button */}
            <button
              onClick={() => navigate('/tutor/dashboard')}
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </button>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-xl p-8 border border-slate-100">
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-full flex items-center justify-center mb-6 shadow-lg border border-secondary-200">
                <FaCheckCircle className="h-12 w-12 text-secondary-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Congratulations! Your KYC is Approved
              </h2>
              <p className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                Your identity verification is complete. You now have full access to create courses, 
                live classes, and assignments for learners to enroll in.
              </p>
              
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => navigate('/tutor/courses/create')}
                  className="px-8 py-3 bg-secondary-600 text-white rounded-xl hover:bg-secondary-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                >
                  Create Your First Course
                </button>
                <button
                  onClick={() => navigate('/tutor/dashboard')}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-error-100 to-error-200 rounded-full p-5 shadow-lg border border-error-200">
                <FaTimes className="text-4xl text-error-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              KYC Verification Required
            </h1>
            <p className="text-xl text-slate-600 mb-6">
              Please resubmit your documents with the required corrections
            </p>
            
            {/* Back Button */}
            <button
              onClick={() => navigate('/tutor/dashboard')}
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </button>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-xl p-8 border border-slate-100">
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 bg-gradient-to-br from-error-100 to-error-200 rounded-full flex items-center justify-center mb-6 shadow-lg border border-error-200">
                <FaTimes className="h-12 w-12 text-error-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                KYC Verification Rejected
              </h2>
              <p className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                Your KYC documents were rejected. Please review the feedback and resubmit with the required corrections.
              </p>
              
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => {
                    setKycStatus('pending');
                    // Reset form to allow resubmission
                  }}
                  className="px-8 py-3 bg-error-600 text-white rounded-xl hover:bg-error-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                >
                  Resubmit KYC Documents
                </button>
                <button
                  onClick={() => navigate('/tutor/dashboard')}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-full p-5 shadow-lg border border-primary-200">
              <FaShieldAlt className="text-4xl text-primary-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Complete Your KYC Verification
          </h1>
          <p className="text-xl text-slate-600 mb-6">
            Verify your identity to start teaching on SkillLift
          </p>
          
          {/* Back Button */}
          <button
            onClick={() => navigate('/tutor/dashboard')}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-xl p-8 border border-slate-100">
          {/* Info Box */}
          <div className="mb-8 p-6 bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-xl shadow-sm">
            <div className="flex items-start">
              <div className="p-3 bg-primary-200 rounded-xl mr-4 flex-shrink-0">
                <FaShieldAlt className="text-primary-600 text-xl" />
              </div>
              <div className="text-sm text-primary-800">
                <p className="font-bold mb-2 text-base">🔒 KYC Verification Required</p>
                <p className="mb-3 leading-relaxed">
                  To ensure the safety and security of our platform, all tutors must complete 
                  Know Your Customer (KYC) verification before they can create courses or receive payments.
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-primary-700">
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
                <label htmlFor="idDocumentType" className="block text-sm font-semibold text-slate-700 mb-2">
                  ID Document Type *
                </label>
                <select
                  id="idDocumentType"
                  name="idDocumentType"
                  value={formik.values.idDocumentType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors bg-slate-50 focus:bg-white ${
                    formik.touched.idDocumentType && formik.errors.idDocumentType
                      ? 'border-error-300'
                      : 'border-slate-300'
                  }`}
                >
                  <option value="">Select ID document type</option>
                  <option value="passport">Passport</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="national_id">National ID</option>
                  <option value="other">Other Government ID</option>
                </select>
                {formik.touched.idDocumentType && formik.errors.idDocumentType && (
                  <p className="mt-1 text-sm text-error-600">{formik.errors.idDocumentType}</p>
                )}
              </div>

              {/* Address Document Type */}
              <div>
                <label htmlFor="addressDocumentType" className="block text-sm font-semibold text-slate-700 mb-2">
                  Address Document Type *
                </label>
                <select
                  id="addressDocumentType"
                  name="addressDocumentType"
                  value={formik.values.addressDocumentType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors bg-slate-50 focus:bg-white ${
                    formik.touched.addressDocumentType && formik.errors.addressDocumentType
                      ? 'border-error-300'
                      : 'border-slate-300'
                  }`}
                >
                  <option value="">Select address document type</option>
                  <option value="utility_bill">Utility Bill</option>
                  <option value="bank_statement">Bank Statement</option>
                  <option value="government_letter">Government Letter</option>
                  <option value="other">Other Address Proof</option>
                </select>
                {formik.touched.addressDocumentType && formik.errors.addressDocumentType && (
                  <p className="mt-1 text-sm text-error-600">{formik.errors.addressDocumentType}</p>
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
              <label htmlFor="notes" className="block text-sm font-semibold text-slate-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors bg-slate-50 focus:bg-white ${
                  formik.touched.notes && formik.errors.notes
                    ? 'border-error-300'
                    : 'border-slate-300'
                }`}
                placeholder="Any additional information you'd like to provide..."
              />
              {formik.touched.notes && formik.errors.notes && (
                <p className="mt-1 text-sm text-error-600">{formik.errors.notes}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-md hover:shadow-lg"
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
