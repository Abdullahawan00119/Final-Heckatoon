import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ChevronLeft, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Simulate API call for demo
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="container min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-heavy border-slate-200">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <CardTitle className="text-2xl font-extrabold">Forgot Password?</CardTitle>
          </div>
          <CardDescription>
            Enter your email and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/15 p-3 rounded-lg flex items-center gap-3 text-destructive text-xs font-medium">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <Button type="submit" className="w-full shadow-medium" disabled={loading}>
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </Button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="bg-green-100 p-3 rounded-full w-fit mx-auto">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Check your email</h3>
                <p className="text-sm text-muted-foreground">
                  We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>.
                </p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setSubmitted(false)}>
                Didn't receive it? Try again
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-center border-t py-4">
          <p className="text-sm text-muted-foreground">
            Remembered your password?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Back to Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
