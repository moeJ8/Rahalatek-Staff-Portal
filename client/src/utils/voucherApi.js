import axios from 'axios';

// Update voucher status
export const updateVoucherStatus = async (voucherId, status) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      `/api/vouchers/${voucherId}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating voucher status:', error);
    throw error;
  }
};

// Get all vouchers (with updated statuses)
export const getAllVouchers = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/vouchers', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    throw error;
  }
};

// Get voucher by ID (with status check)
export const getVoucherById = async (voucherId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`/api/vouchers/${voucherId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching voucher:', error);
    throw error;
  }
}; 