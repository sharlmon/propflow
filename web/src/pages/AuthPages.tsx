import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthProvider';
import { Button } from '../components/ui/Button';
import { FormField } from '../components/ui/FormField';

const loginSchema = z.object({ email: z.string().email('Enter a valid email.'), password: z.string().min(1, 'Enter your password.') });
const registerSchema = z.object({
  full_name: z.string().min(2, 'Enter your full name.'), email: z.string().email('Enter a valid email.'),
  phone: z.string(), password: z.string().min(10, 'Use at least 10 characters.'), role: z.enum(['landlord', 'renter']),
});
type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

function AuthCard({ children, title, intro }: { children: React.ReactNode; title: string; intro: string }) {
  return <main className="grid min-h-[calc(100vh-65px)] place-items-center p-4"><section className="w-full max-w-md rounded-2xl border border-blue-100 bg-white p-6 shadow-lg shadow-blue-950/5 sm:p-8"><h1 className="text-3xl font-bold text-slate-900">{title}</h1><p className="mt-2 text-slate-600">{intro}</p><div className="mt-7">{children}</div></section></main>;
}

export function LoginPage() {
  const { user, login } = useAuth(); const navigate = useNavigate(); const location = useLocation();
  const [submitError, setSubmitError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  if (user) return <Navigate to={user.role === 'landlord' ? '/landlord/dashboard' : '/renter/dashboard'} replace />;
  async function submit(values: LoginValues) {
    setSubmitError('');
    try { const signedIn = await login(values); const requested = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname; navigate(requested || (signedIn.role === 'landlord' ? '/landlord/dashboard' : '/renter/dashboard'), { replace: true }); }
    catch (error) { setSubmitError(error instanceof ApiError ? error.message : 'Unable to sign in.'); }
  }
  return <AuthCard title="Welcome back" intro="Sign in to continue to your property or renter workspace."><form className="space-y-5" onSubmit={handleSubmit(submit)} noValidate>{submitError ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{submitError}</p> : null}<FormField label="Email" type="email" autoComplete="email" {...register('email')} error={errors.email?.message} /><FormField label="Password" type="password" autoComplete="current-password" {...register('password')} error={errors.password?.message} /><Button className="w-full" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Sign in'}</Button></form><p className="mt-6 text-sm text-slate-600">New here? <Link className="font-semibold text-blue-700" to="/register">Create an account</Link></p></AuthCard>;
}

export function RegisterPage() {
  const { user, register: createAccount } = useAuth(); const navigate = useNavigate(); const [submitError, setSubmitError] = useState('');
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), defaultValues: { role: 'renter', phone: '' } });
  if (user) return <Navigate to={user.role === 'landlord' ? '/landlord/dashboard' : '/renter/dashboard'} replace />;
  async function submit(values: RegisterValues) { setSubmitError(''); try { const created = await createAccount(values); navigate(created.role === 'landlord' ? '/landlord/dashboard' : '/renter/dashboard'); } catch (error) { if (error instanceof ApiError) { Object.entries(error.fields).forEach(([name, message]) => setError(name as keyof RegisterValues, { message })); setSubmitError(error.message); } else setSubmitError('Unable to create the account.'); } }
  return <AuthCard title="Create your account" intro="Choose the experience you need today."><form className="space-y-5" onSubmit={handleSubmit(submit)} noValidate>{submitError ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{submitError}</p> : null}<div><span className="mb-2 block text-sm font-semibold">I am a</span><div className="grid grid-cols-2 gap-3"><label className="rounded-xl border p-3"><input type="radio" value="renter" {...register('role')} /> <span className="ml-2">Renter</span></label><label className="rounded-xl border p-3"><input type="radio" value="landlord" {...register('role')} /> <span className="ml-2">Landlord</span></label></div></div><FormField label="Full name" autoComplete="name" {...register('full_name')} error={errors.full_name?.message} /><FormField label="Email" type="email" autoComplete="email" {...register('email')} error={errors.email?.message} /><FormField label="Phone (optional)" type="tel" autoComplete="tel" {...register('phone')} error={errors.phone?.message} /><FormField label="Password" type="password" autoComplete="new-password" {...register('password')} error={errors.password?.message} /><Button className="w-full" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating account…' : 'Create account'}</Button></form><p className="mt-6 text-sm text-slate-600">Already registered? <Link className="font-semibold text-blue-700" to="/login">Sign in</Link></p></AuthCard>;
}
