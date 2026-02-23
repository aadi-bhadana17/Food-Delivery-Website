import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupApi } from '../../api/authService';
import { AuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// Variants for staggered entrance
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 }
};

const Signup = () => {
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '', confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Matches the @AssertTrue logic in SignupRequest.java
        if (formData.password !== formData.confirmPassword) {
            return setMsg({ type: 'error', text: 'Passwords do not match' });
        }

        setLoading(true);
        try {
            // Sends SignupRequest DTO to backend
            const data = await signupApi(formData);
            setMsg({ type: 'success', text: 'Account created! Redirecting...' });
            
            setTimeout(() => {
                login(data); // Stores LoginAuthResponse in localStorage
                navigate('/dashboard');
            }, 1500);
        } catch (err) {
            // Captches 409 Conflict if email exists in UserRepository
            setMsg({ type: 'error', text: err.response?.data?.message || "Registration failed" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            className="auth-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
        >
            <motion.h2 
                initial={{ y: -10, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }}
            >
                Join Kilgore Food
            </motion.h2>

            <motion.form 
                className="auth-form" 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                onSubmit={handleSubmit}
            >
                <div style={{display: 'flex', gap: '5px'}}>
                    <motion.input 
                        variants={itemVariants}
                        type="text" placeholder="First Name" required 
                        onChange={e => setFormData({...formData, firstName: e.target.value})} 
                    />
                    <motion.input 
                        variants={itemVariants}
                        type="text" placeholder="Last Name" 
                        onChange={e => setFormData({...formData, lastName: e.target.value})} 
                    />
                </div>
                
                <motion.input 
                    variants={itemVariants}
                    type="email" placeholder="Email" required 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                />
                
                <motion.input 
                    variants={itemVariants}
                    type="password" placeholder="Password (min 8 chars)" required 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                />
                
                <motion.input 
                    variants={itemVariants}
                    type="password" placeholder="Confirm Password" required 
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                />
                
                <motion.button 
                    variants={itemVariants}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit" 
                    disabled={loading}
                >
                    {loading ? "Creating Account..." : "Sign Up"}
                </motion.button>
            </motion.form>

            <AnimatePresence>
                {msg.text && (
                    <motion.p 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ 
                            color: msg.type === 'error' ? '#e74c3c' : '#2ecc71', 
                            marginTop: '15px',
                            fontWeight: '500' 
                        }}
                    >
                        {msg.text}
                    </motion.p>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Signup;