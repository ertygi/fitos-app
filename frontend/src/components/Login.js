import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, List, ListItem, ListItemButton, ListItemText, CircularProgress, Alert } from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL || '';

export default function Login({ onLogin }) {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/api/users`)
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(() => setError("Could not fetch users. Is the backend running?"))
            .finally(() => setLoading(false));
    }, []);

    const handleLogin = () => {
        if (selectedUser) {
            onLogin(selectedUser);
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <Paper sx={{ p: 4, width: '100%', maxWidth: 400, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>Select Profile</Typography>
                {loading && <CircularProgress />}
                {error && <Alert severity="error">{error}</Alert>}
                {!loading && !error && (
                    <>
                        <List>
                            {users.map(user => (
                                <ListItemButton
                                    key={user.id}
                                    selected={selectedUser?.id === user.id}
                                    onClick={() => setSelectedUser(user)}
                                >
                                    <ListItemText primary={user.name} />
                                </ListItemButton>
                            ))}
                        </List>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="large"
                            onClick={handleLogin}
                            disabled={!selectedUser}
                            sx={{ mt: 2 }}
                        >
                            Login
                        </Button>
                    </>
                )}
            </Paper>
        </Box>
    );
}
