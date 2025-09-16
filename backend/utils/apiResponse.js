/**
 * Standardized API Response Helper
 * Provides consistent response format across all API endpoints
 */

class ApiResponse {
  /**
   * Success response
   * @param {any} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default: 200)
   * @param {object} pagination - Pagination data (optional)
   * @returns {object} Standardized success response
   */
  static success(data = null, message = 'Operation completed successfully', statusCode = 200, pagination = null) {
    const response = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      statusCode
    };

    if (pagination) {
      response.pagination = pagination;
    }

    return response;
  }

  /**
   * Error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 400)
   * @param {any} errors - Validation errors or additional error details
   * @returns {object} Standardized error response
   */
  static error(message = 'Operation failed', statusCode = 400, errors = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
      statusCode
    };

    if (errors) {
      response.errors = errors;
    }

    return response;
  }

  /**
   * Pagination helper
   * @param {Array} data - Array of data items
   * @param {number} page - Current page number
   * @param {number} limit - Items per page
   * @param {number} total - Total number of items
   * @returns {object} Pagination metadata
   */
  static pagination(data, page, limit, total) {
    return {
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Validation error response
   * @param {Array} errors - Array of validation errors
   * @returns {object} Standardized validation error response
   */
  static validationError(errors) {
    return this.error('Validation failed', 422, errors);
  }

  /**
   * Not found response
   * @param {string} resource - Name of the resource not found
   * @returns {object} Standardized not found response
   */
  static notFound(resource = 'Resource') {
    return this.error(`${resource} not found`, 404);
  }

  /**
   * Unauthorized response
   * @param {string} message - Unauthorized message
   * @returns {object} Standardized unauthorized response
   */
  static unauthorized(message = 'Not authorized') {
    return this.error(message, 401);
  }

  /**
   * Forbidden response
   * @param {string} message - Forbidden message
   * @returns {object} Standardized forbidden response
   */
  static forbidden(message = 'Access denied') {
    return this.error(message, 403);
  }

  /**
   * Server error response
   * @param {string} message - Server error message
   * @returns {object} Standardized server error response
   */
  static serverError(message = 'Internal server error') {
    return this.error(message, 500);
  }
}

module.exports = ApiResponse;
