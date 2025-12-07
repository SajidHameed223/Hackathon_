/**
 * API Client for Qubic Autonomous Execution System
 * Connects to the API Gateway at http://localhost:8000 (or NEXT_PUBLIC_API_URL)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Make an API request with error handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Remove headers from options to avoid duplication
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        message: `HTTP ${response.status}: ${response.statusText}` 
      }));
      throw new Error(errorData.message || errorData.detail || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Failed to connect to API Gateway. Please ensure the service is running.');
    }
    throw error;
  }
}

const apiClient = {
  /**
   * Check API Gateway health status
   * @returns {Promise<Object>} Health status object
   */
  async healthCheck() {
    return request('/health');
  },

  /**
   * Start a new task
   * @param {Object} taskData - Task data
   * @param {string} taskData.task_type - Type of task (e.g., 'monitor_wallet', 'transfer_funds')
   * @param {string} taskData.wallet_address - Wallet address
   * @param {string} taskData.description - Task description
   * @param {Object} [taskData.parameters] - Additional task parameters
   * @returns {Promise<Object>} Task creation response with task_id, status, and message
   */
  async startTask(taskData) {
    return request('/task/start', {
      method: 'POST',
      body: taskData,
    });
  },

  /**
   * Get task status
   * @param {string} taskId - Task ID
   * @returns {Promise<Object>} Task status object
   */
  async getTaskStatus(taskId) {
    return request(`/task/${taskId}`);
  },

  /**
   * Approve or reject a task
   * @param {string} taskId - Task ID
   * @param {boolean} approved - Whether to approve (true) or reject (false)
   * @param {string} reason - Reason for approval/rejection
   * @returns {Promise<Object>} Approval response
   */
  async approveTask(taskId, approved, reason) {
    return request(`/task/${taskId}/approve`, {
      method: 'POST',
      body: {
        approved,
        reason,
      },
    });
  },

  /**
   * Get audit log for a task
   * @param {string} taskId - Task ID
   * @returns {Promise<Object>} Audit log object with logs array and qubic_txid
   */
  async getAuditLog(taskId) {
    return request(`/audit/${taskId}`);
  },
};

export default apiClient;
