import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { exchangeOneLoginToken, setError } from '../../store/slices/authSlice';

const Callback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const exchangeAttempted = useRef(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      if (user.role === 'Manager') {
        navigate('/job-openings', { replace: true });
      } else if (user.role === 'RMG') {
        navigate('/interviews', { replace: true });
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    console.log('Callback useEffect triggered');
    let isSubscribed = true;

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    console.log('code', code);
    const state = urlParams.get("state");
    const error = urlParams.get("error");
    const error_description = urlParams.get("error_description");
    const storedState = sessionStorage.getItem('onelogin_state');

    const exchangeToken = async () => {
      if (!isSubscribed || exchangeAttempted.current) return;
      exchangeAttempted.current = true;
      console.log('Exchanging token...');
      console.log('Stored state:', storedState);
      
      if (state !== storedState) {
        cleanupSessionStorage();
        dispatch(setError('State mismatch. Possible CSRF attack.'));
        navigate("/login");
        return;
      }

      try {
        const result = await dispatch(exchangeOneLoginToken(code)).unwrap();
        console.log('Token exchange successful');
        cleanupSessionStorage();
      } catch (err) {
        cleanupSessionStorage();
        console.error("Token exchange failed:", err);
        navigate("/login");
      }
    };

    const cleanupSessionStorage = () => {
      sessionStorage.removeItem('onelogin_state');
    };

    if (error || error_description) {
      console.error("OneLogin error:", error, error_description);
      cleanupSessionStorage();
      dispatch(setError(`Authentication failed: ${error_description || error}`));
      navigate("/login");
    } else if (!code || !state) {
      console.error("Missing required parameters");
      cleanupSessionStorage();
      dispatch(setError("Authentication failed: Missing required parameters"));
      navigate("/login");
    } else if (!exchangeAttempted.current) {
      console.log('Calling exchangeToken');
      exchangeToken();
    }

    return () => {
      console.log('Cleanup function called');
      isSubscribed = false;
    };
  }, [navigate, dispatch]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p>Completing authentication...</p>
    </div>
  );
};

export default Callback;
