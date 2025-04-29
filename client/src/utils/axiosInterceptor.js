import axios from 'axios';
import { toast } from 'react-hot-toast';


const setupInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    
    (error) => {
 
      if (error.response && (error.response.status === 401 || error.response.data?.message === 'Invalid token.')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        toast.error('Your session has expired. Please sign in again.', {
          duration: 5000,
          style: {
            background: '#f44336',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '16px',
            padding: '16px',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#f44336',
          },
        });

        window.dispatchEvent(new Event('auth-change'));
        
        setTimeout(() => {
          window.location.href = '/signin';
        }, 1500);
      }
      
      return Promise.reject(error);
    }
  );
  
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

export default setupInterceptors; 