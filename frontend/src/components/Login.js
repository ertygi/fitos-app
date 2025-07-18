import React, { useState } from 'react';
import { Box, Button, Typography, Paper, TextField, Alert, Link } from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL || '';

export default function Login({ onLogin, onNavigateToRegister }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }
            onLogin(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <Paper sx={{ p: 4, width: '100%', maxWidth: 400, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>Login</Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box component="form" onSubmit={handleLogin} noValidate>
                    <TextField
                        margin="normal" required fullWidth id="email"
                        label="Email Address" name="email" autoComplete="email"
                        autoFocus value={email} onChange={e => setEmail(e.target.value)}
                    />
                    <TextField
                        margin="normal" required fullWidth name="password"
                        label="Password" type="password" id="password"
                        autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit" fullWidth variant="contained"
                        sx={{ mt: 3, mb: 2 }} disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Sign In'}
                    </Button>
                    <Link href="#" variant="body2" onClick={onNavigateToRegister}>
                        {"Don't have an account? Sign Up"}
                    </Link>
                </Box>
            </Paper>
        </Box>
    );
}