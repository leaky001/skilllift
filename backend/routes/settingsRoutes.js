const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getPlatformSettings,
  updatePlatformSettings,
  updateSettingCategory,
  resetSettingsToDefaults,
  getPublicSettings,
  updatePaymentSettings,
  getSettingsAuditLog,
  exportSettings
} = require('../controllers/settingsController');

// Public routes (no authentication required)
router.get('/public', getPublicSettings);

// Admin routes (protected, admin only)
router.get('/', protect, authorize('admin'), getPlatformSettings);
router.put('/', protect, authorize('admin'), updatePlatformSettings);
router.put('/:category', protect, authorize('admin'), updateSettingCategory);
router.post('/reset', protect, authorize('admin'), resetSettingsToDefaults);
router.put('/payments', protect, authorize('admin'), updatePaymentSettings);
router.get('/audit-log', protect, authorize('admin'), getSettingsAuditLog);
router.get('/export', protect, authorize('admin'), exportSettings);

module.exports = router;
