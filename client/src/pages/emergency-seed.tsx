import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function EmergencySeed() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/emergency/seed-emma', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Seeding failed');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-8 flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">🚨 Emergency Production Database Seed</CardTitle>
          <CardDescription>
            This will seed Emma Johnson's demo data into the PRODUCTION database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleSeed} 
            disabled={loading}
            className="w-full"
            size="lg"
            data-testid="button-seed-production"
          >
            {loading ? 'Seeding Production Database...' : 'Seed Emma Data Now'}
          </Button>

          {result && (
            <>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">✅ Success!</h3>
                <p className="text-green-700 dark:text-green-300">{result.message}</p>
                <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                  <p>Service Hours: {result.hours}</p>
                  <p>Echo Tokens: {result.tokens}</p>
                </div>
              </div>
              
              <Button 
                onClick={() => window.location.href = '/demo-login'}
                className="w-full"
                size="lg"
                variant="default"
                data-testid="button-go-to-app"
              >
                🚀 Go to App & Login as Emma
              </Button>
            </>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">❌ Error</h3>
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p><strong>What this does:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Clears existing demo data</li>
              <li>Creates Emma Johnson student account</li>
              <li>Adds 7.5 verified service hours</li>
              <li>Sets 1,103 Echo Tokens balance</li>
              <li>Creates 4-day streak</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
