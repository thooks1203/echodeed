import { SupportCircle } from '@/components/SupportCircle';
import { useLocation } from 'wouter';

export default function SupportPage() {
  const [, navigate] = useLocation();

  const handleBack = () => {
    // Navigate back to the previous page or main feed
    navigate('/app');
  };

  return <SupportCircle onBack={handleBack} />;
}