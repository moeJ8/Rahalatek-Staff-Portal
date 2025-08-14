import axios from 'axios';

export const getMySalary = async () => {
  const response = await axios.get('/api/profile/me/salary');
  return response.data;
};

export const getUserSalary = async (userId) => {
  const response = await axios.get(`/api/profile/${userId}/salary`);
  return response.data;
};

export const updateUserSalary = async (userId, data) => {
  const response = await axios.put(`/api/profile/${userId}/salary`, data);
  return response.data;
};

export const getUserBonuses = async (userId) => {
  const response = await axios.get(`/api/profile/${userId}/bonuses`);
  return response.data;
};

export const saveMonthlyBonus = async (userId, { year, month, amount, note }) => {
  const response = await axios.post(`/api/profile/${userId}/bonuses`, {
    year, month, amount, note
  });
  return response.data;
};

export const getMyBonuses = async () => {
  const response = await axios.get('/api/profile/me/bonuses');
  return response.data;
};

export const saveMonthlyBaseSalary = async (userId, { year, month, amount, note }) => {
  const response = await axios.post(`/api/profile/${userId}/salary/base`, { year, month, amount, note });
  return response.data;
};

export const getUserSalaryBaseEntries = async (userId) => {
  const response = await axios.get(`/api/profile/${userId}/salary/base`);
  return response.data;
};

export const editMonthSalary = async (userId, { year, month, amount, note }) => {
  const response = await axios.put(`/api/profile/${userId}/salary/edit`, {
    year, month, amount, note
  });
  return response.data;
};

export const editMonthBonus = async (userId, { year, month, amount, note }) => {
  const response = await axios.put(`/api/profile/${userId}/bonus/edit`, {
    year, month, amount, note
  });
  return response.data;
};


