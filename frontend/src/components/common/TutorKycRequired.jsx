import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaIdCard, FaCheckCircle } from 'react-icons/fa';

const TutorKycRequired = ({
  title = 'Complete Your KYC Verification',
  description = 'You must complete and have your KYC approved before accessing this feature.',
  featureList = []
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        <div className="relative bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary-200/40 rounded-full blur-3xl" aria-hidden />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-200/30 rounded-full blur-3xl" aria-hidden />

          <div className="relative p-10 sm:p-12">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center space-x-3 bg-primary-50 text-primary-700 px-4 py-2 rounded-full font-semibold text-sm mb-6">
                  <FaShieldAlt />
                  <span>KYC Approval Required</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                  {title}
                </h1>

                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                  {description}
                </p>

                {featureList.length > 0 && (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8">
                    <div className="flex items-center mb-4 text-slate-700 font-semibold text-base">
                      <FaCheckCircle className="mr-3 text-primary-600" />
                      <span>Unlock these tutor capabilities:</span>
                    </div>
                    <ul className="space-y-3">
                      {featureList.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start text-slate-600"
                        >
                          <FaIdCard className="mr-3 mt-1 text-primary-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/tutor/kyc-submission')}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    <FaShieldAlt className="mr-2" />
                    Complete KYC Verification
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </div>

              <div className="w-full sm:w-72 bg-gradient-to-br from-primary-600 to-primary-500 text-white rounded-3xl p-8 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#fff_0%,_transparent_60%)]" aria-hidden />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-6">
                    <FaShieldAlt className="text-2xl" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-3">Why KYC Matters</h2>
                  <p className="text-white/90 leading-relaxed">
                    Verifying your identity helps us keep the Skill Lift community safe, protect learner trust,
                    and enable secure payouts for your hard work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

TutorKycRequired.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  featureList: PropTypes.arrayOf(PropTypes.string)
};

export default TutorKycRequired;

