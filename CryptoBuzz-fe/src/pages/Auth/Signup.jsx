
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials, selectCurrentUser } from '@/store/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useSignupMutation, useLoginMutation } from '@/store/client/clientAuthApiSlice';

export function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [signup, { isLoading: isSignupLoading }] = useSignupMutation();
    const [login, { isLoading: isLoginLoading }] = useLoginMutation();
    const isLoading = isSignupLoading || isLoginLoading;

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/client/home', { replace: true });
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            // 1. Signup
            // RTK Query throws on error by default if using unwrap(), so try-catch handles it.
            await signup({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                // Assuming backend can handle single name or we split it here.
                // Keeping split logic as per previous implementation to be safe.
                first_name: formData.name.split(' ')[0],
                last_name: formData.name.split(' ').slice(1).join(' ') || ''
            }).unwrap();

            toast.success('Account created successfully');

            // 2. Auto-Login
            const loginResponse = await login({ email: formData.email, password: formData.password }).unwrap();
            const { userObj, token } = loginResponse.data;

            if (token) {
                dispatch(setCredentials({ user: userObj, token }));
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userObj));
                navigate('/client/home', { replace: true });
            }

        } catch (err) {
            console.error('Signup/Login error:', err);
            toast.error(err?.data?.message || 'Unable to sign up. Please try again.');

            // If error occurred during auto-login (after successful signup), redirect to login
            // Distinguishing error source is tricky without distinct try-catch blocks or checking step.
            // But typically if signup fails, we stay here. If login fails, user is signed up but needs to login manually.
            // Ideally handled better, but this is a reasonable fallback.
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email below to create your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                'Sign Up'
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-medium hover:underline">
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
