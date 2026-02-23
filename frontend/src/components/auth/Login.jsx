import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginApi } from '../../api/authService';
import { AuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants for the sequenced entrance
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await loginApi(credentials);
            login(data); // Save to context and localStorage
            
            // Dynamic Redirect based on backend role
            if (data.role === 'ADMIN') navigate('/admin');
            else if (data.role === 'RESTAURANT_OWNER') navigate('/restaurant');
            else navigate('/dashboard');
        } catch (err) {
            // Catches invalid credentials returned by the AuthenticationManager
            setError(err.response?.data?.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            className="auth-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <motion.h2 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.2 }}
            >
                Welcome Back
            </motion.h2>

            <motion.form 
                className="auth-form" 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                onSubmit={handleSubmit}
            >
                <motion.input 
                    variants={itemVariants}
                    type="email" 
                    placeholder="Email Address" 
                    disabled={loading}
                    required 
                    onChange={e => setCredentials({...credentials, email: e.target.value})} 
                />
                
                <motion.input 
                    variants={itemVariants}
                    type="password" 
                    placeholder="Password" 
                    disabled={loading}
                    required 
                    onChange={e => setCredentials({...credentials, password: e.target.value})} 
                />
                
                <motion.button 
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={loading}
                >
                    {loading ? "Authenticating..." : "Login"}
                </motion.button>
            </motion.form>

            <AnimatePresence>
                {error && (
                    <motion.p 
                        className="error-text"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ color: '#e74c3c', marginTop: '15px', overflow: 'hidden' }}
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>

            <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.8 }}
                style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}
            >
                New here? <Link to="/signup" style={{ color: '#e67e22', fontWeight: 'bold' }}>Create an account</Link>
            </motion.p>
        </motion.div>
    );
};

export default Login;