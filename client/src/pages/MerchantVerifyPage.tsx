import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Shield, Store } from "lucide-react";

interface RedemptionDetails {
  redemptionCode: string;
  offerTitle: string;
  offerValue: string;
  partnerName: string;
  studentFirstName: string;
  status: string;
  expiresAt: string;
  verifiedByMerchant: boolean;
  usedAt?: string;
}

interface VerificationResult {
  success: boolean;
  message: string;
  redemption?: RedemptionDetails;
}

export default function MerchantVerifyPage() {
  const [match, params] = useRoute("/r/:code");
  const [redemption, setRedemption] = useState<RedemptionDetails | null>(null);
  const [merchantPin, setMerchantPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const redemptionCode = params?.code || "";

  // Load redemption details
  useEffect(() => {
    if (!redemptionCode) return;

    const fetchRedemption = async () => {
      setLoading(true);
      setError("");
      
      try {
        const response = await fetch(`/api/rewards/verify/${redemptionCode}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load redemption');
        }

        setRedemption(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load redemption details');
      } finally {
        setLoading(false);
      }
    };

    fetchRedemption();
  }, [redemptionCode]);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantPin.trim() || !redemption) return;

    setVerifying(true);
    setError("");

    try {
      const response = await fetch('/api/rewards/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          redemptionCode: redemption.redemptionCode,
          merchantPin: merchantPin.trim()
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Verification failed');
      }

      setVerificationResult(result);
      if (result.redemption) {
        setRedemption(result.redemption);
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  if (!match || !redemptionCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <CardTitle>Invalid Link</CardTitle>
            <CardDescription>
              This verification link is not valid. Please check the QR code or link provided by the customer.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading redemption details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !redemption) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (verificationResult?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <CardTitle className="text-green-600">Verified Successfully!</CardTitle>
            <CardDescription>
              This redemption has been processed and marked as used.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-green-800">{redemption?.offerTitle}</h3>
              <p className="text-green-700">Value: {redemption?.offerValue}</p>
              <p className="text-green-600 text-sm mt-2">
                Verified at {new Date().toLocaleString()}
              </p>
            </div>
            <p className="text-sm text-gray-600">
              Customer: {redemption?.studentFirstName} (First name only for privacy)
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (redemption?.verifiedByMerchant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-orange-500 mb-4" />
            <CardTitle className="text-orange-600">Already Used</CardTitle>
            <CardDescription>
              This redemption code has already been verified and used.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-800">{redemption.offerTitle}</h3>
              <p className="text-orange-700">Value: {redemption.offerValue}</p>
              {redemption.usedAt && (
                <p className="text-orange-600 text-sm mt-2">
                  Used: {new Date(redemption.usedAt).toLocaleString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">EchoDeed™</span>
          </div>
          <p className="text-gray-600">Merchant Verification Portal</p>
        </div>

        {/* Redemption Details */}
        {redemption && (
          <Card className="mb-6" data-testid="redemption-details">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-lg">Redemption Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900">{redemption.offerTitle}</h3>
                  <p className="text-blue-800">Value: {redemption.offerValue}</p>
                  <p className="text-blue-700 text-sm">Partner: {redemption.partnerName}</p>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Code:</span>
                  <span className="font-mono font-semibold" data-testid="redemption-code">
                    {redemption.redemptionCode}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Customer:</span>
                  <span>{redemption.studentFirstName} (First name only)</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Expires:</span>
                  <span>{new Date(redemption.expiresAt).toLocaleDateString()}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-semibold ${
                    redemption.status === 'active' ? 'text-green-600' : 
                    redemption.status === 'expired' ? 'text-red-600' : 'text-orange-600'
                  }`}>
                    {redemption.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verification Form */}
        {redemption && redemption.status === 'active' && !redemption.verifiedByMerchant && (
          <Card>
            <CardHeader>
              <CardTitle>Verify Redemption</CardTitle>
              <CardDescription>
                Enter your merchant PIN to complete this redemption
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerification} className="space-y-4">
                <div>
                  <Input
                    type="password"
                    placeholder="Enter Merchant PIN"
                    value={merchantPin}
                    onChange={(e) => setMerchantPin(e.target.value)}
                    maxLength={6}
                    className="text-center text-lg"
                    data-testid="input-merchant-pin"
                    disabled={verifying}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={!merchantPin.trim() || verifying}
                  data-testid="button-verify"
                >
                  {verifying ? "Verifying..." : "Verify & Complete Redemption"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Expired Code */}
        {redemption && redemption.status === 'expired' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This redemption code has expired and cannot be used.
            </AlertDescription>
          </Alert>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500">
          <p>Secure merchant verification powered by EchoDeed™</p>
          <p className="mt-1">Questions? Contact your EchoDeed representative</p>
        </div>
      </div>
    </div>
  );
}