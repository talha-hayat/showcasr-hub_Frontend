/**
 * OTP Verification Component
 * 
 * Handles OTP verification for signup and password reset flows.
 * Uses a clean, focused interface with input-otp for better UX.
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { OTPFormData } from '@/types';

// OTP validation schema
const otpSchema = z.object({
  otp: z.string().length(6, 'Please enter the complete 6-digit code'),
});

interface OTPVerificationProps {
  email: string;
  onSubmit: (data: OTPFormData) => void;
  onResendOTP: () => void;
  onGoBack?: () => void;
  isLoading?: boolean;
  error?: string;
  title?: string;
  description?: string;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  onSubmit,
  onResendOTP,
  onGoBack,
  isLoading = false,
  error,
  title = "Verify Your Email",
  description = "We've sent a verification code to your email address"
}) => {
  const [isResending, setIsResending] = React.useState(false);
  const [otpValue, setOtpValue] = React.useState('');

  const {
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema)
  });

  // Handle OTP input change
  const handleOTPChange = (value: string) => {
    setOtpValue(value);
    setValue('otp', value);
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      await onResendOTP();
    } finally {
      setIsResending(false);
    }
  };

  // Auto-submit when OTP is complete
  React.useEffect(() => {
    if (otpValue.length === 6) {
      handleSubmit(onSubmit)();
    }
  }, [otpValue, handleSubmit, onSubmit]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          {onGoBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onGoBack}
              className="w-fit mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
          <CardDescription className="text-center">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Display */}
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{email}</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* OTP Input */}
            <div className="space-y-2">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otpValue}
                  onChange={handleOTPChange}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {errors.otp && (
                <p className="text-sm text-destructive text-center">{errors.otp.message}</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <p className="text-sm text-destructive text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || otpValue.length !== 6}
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>
          </form>

          {/* Resend Section */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResendOTP}
              disabled={isResending}
              className="text-primary hover:text-primary/80"
            >
              {isResending ? 'Sending...' : 'Resend Code'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};