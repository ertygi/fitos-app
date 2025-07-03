import React, { useState } from 'react';
import { Box, Button, Typography, Paper, TextField, Alert, Link } from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL || '';

export default function Register({ onRegisterSuccess, onBackToLogin }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }
            alert('Registration successful! Please log in.');
            onRegisterSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <Paper sx={{ p: 4, width: '100%', maxWidth: 400, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>Sign Up</Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box component="form" onSubmit={handleRegister} noValidate>
                     <TextField
                        margin="normal" required fullWidth id="name"
                        label="Name" name="name" autoComplete="name"
                        value={name} onChange={e => setName(e.target.value)}
                    />
                    <TextField
                        margin="normal" required fullWidth id="email"
                        label="Email Address" name="email" autoComplete="email"
                        value={email} onChange={e => setEmail(e.target.value)}
                    />
                    <TextField
                        margin="normal" required fullWidth name="password"
                        label="Password" type="password" id="password"
                        value={password} onChange={e => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit" fullWidth variant="contained"
                        sx={{ mt: 3, mb: 2 }} disabled={loading}
                    >
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </Button>
                    <Link href="#" variant="body2" onClick={onBackToLogin}>
                        {"Already have an account? Sign In"}
                    </Link>
                </Box>
            </Paper>
        </Box>
    );
}