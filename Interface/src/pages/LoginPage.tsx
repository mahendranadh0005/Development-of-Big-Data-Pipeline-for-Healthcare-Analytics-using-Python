import React, { useState } from 'react';
import { Building2, Stethoscope, ArrowRight, Activity, Shield, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

type Portal = 'admin' | 'doctor' | null;

export default function LoginPage() {
  const [selectedPortal, setSelectedPortal] = useState<Portal>(null);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPortal) return;

    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = login(userId, password, selectedPortal);
    
    if (!result.success) {
      toast({
        title: 'Login Failed',
        description: result.error,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Welcome!',
        description: 'You have successfully logged in.',
      });
    }
    
    setIsLoading(false);
  };

  const handleBack = () => {
    setSelectedPortal(null);
    setUserId('');
    setPassword('');
  };

  if (selectedPortal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-hero)' }}>
        <div className="w-full max-w-md fade-in">
          <div className="glass-card p-8">
            <button
              onClick={handleBack}
              className="text-muted-foreground hover:text-foreground transition-colors mb-6 flex items-center gap-2 text-sm"
            >
              ← Back to Portal Selection
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                {selectedPortal === 'admin' ? (
                  <Building2 className="w-7 h-7 text-primary-foreground" />
                ) : (
                  <Stethoscope className="w-7 h-7 text-primary-foreground" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {selectedPortal === 'admin' ? 'Hospital Admin' : 'Doctor Portal'}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {selectedPortal === 'admin' ? 'Manage hospital records' : 'Access patient records'}
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder={selectedPortal === 'admin' ? 'admin_hospital' : 'dr_cardiology'}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-12"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="loading-spinner" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground font-medium mb-3">Demo Credentials:</p>
              {selectedPortal === 'admin' ? (
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong className="text-foreground">User ID:</strong> admin_hospital</p>
                  <p><strong className="text-foreground">Password:</strong> admin123</p>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground space-y-2">
                  <div>
                    <p><strong className="text-foreground">Cardiologist:</strong></p>
                    <p>User ID: dr_cardiology | Password: doctor123</p>
                  </div>
                  <div>
                    <p><strong className="text-foreground">Neurologist:</strong></p>
                    <p>User ID: dr_neuro | Password: doctor123</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-hero)' }}>
      <div className="container mx-auto px-4 py-12 min-h-screen flex flex-col">
        {/* Header */}
        <header className="text-center mb-12 fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">MedCare HMS</h1>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto">
            Comprehensive Hospital Management System for efficient healthcare administration
          </p>
        </header>

        {/* Portal Selection */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-4xl">
            <h2 className="text-center text-xl font-semibold text-foreground mb-8 fade-in">
              Select Portal
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Hospital Admin Portal */}
              <div
                className="portal-card bg-card fade-in"
                onClick={() => setSelectedPortal('admin')}
                style={{ animationDelay: '0.1s' }}
              >
                <div className="portal-card-icon">
                  <Building2 className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Hospital Record Management
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Manage patients, visits, doctors, and hospital records. Upload and process CSV data.
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> Patient Records
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-4 h-4" /> Admin Access
                  </span>
                </div>
              </div>

              {/* Doctor Portal */}
              <div
                className="portal-card bg-card fade-in"
                onClick={() => setSelectedPortal('doctor')}
                style={{ animationDelay: '0.2s' }}
              >
                <div className="portal-card-icon">
                  <Stethoscope className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Doctor Record Management
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Access your patients, manage prescriptions, and track visit outcomes.
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Activity className="w-4 h-4" /> Prescriptions
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-4 h-4" /> Doctor Access
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-6 text-sm text-muted-foreground fade-in">
          <p>© 2024 MedCare HMS. Secure Healthcare Management.</p>
        </footer>
      </div>
    </div>
  );
}
