import { useState } from 'react';
import { Heart, X, Phone, Globe, Users, Gift, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface HeartLinkButtonProps {
  position?: 'bottom-right' | 'bottom-left';
}

export function HeartLinkButton({ position = 'bottom-right' }: HeartLinkButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const crisisResources = [
    {
      id: 'national-crisis',
      name: '988 Suicide & Crisis Lifeline',
      description: 'Free, confidential 24/7 support',
      action: 'Call or Text 988',
      icon: Phone,
      color: 'from-red-500 to-rose-600',
      link: 'tel:988',
      urgent: true
    },
    {
      id: 'crisis-text',
      name: 'Crisis Text Line',
      description: 'Text HOME to 741741',
      action: 'Text for Help',
      icon: Phone,
      color: 'from-blue-500 to-indigo-600',
      link: 'sms:741741?body=HOME',
      urgent: true
    },
    {
      id: 'guilford-mental-health',
      name: 'Guilford County Mental Health',
      description: 'Local mental health resources',
      action: 'Visit Website',
      icon: Globe,
      color: 'from-emerald-500 to-teal-600',
      link: 'https://www.guilfordcountync.gov/our-county/human-services/behavioral-health',
      urgent: false
    },
    {
      id: 'school-counselor',
      name: 'School Counselor',
      description: 'Talk to your school counselor',
      action: 'Find Counselor',
      icon: Users,
      color: 'from-purple-500 to-violet-600',
      link: '#counselor',
      urgent: false
    }
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #ec4899, #ef4444)',
          color: 'white',
          ...(position === 'bottom-right' 
            ? { right: '16px', bottom: '100px' }
            : { left: '16px', bottom: '100px' }
          )
        }}
        data-testid="button-heart-link"
        aria-label="Need Support? Talk Now"
      >
        <Heart className="w-5 h-5 animate-pulse" fill="white" />
        <span className="text-sm font-semibold whitespace-nowrap">Need Support?</span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Heart className="w-6 h-6 text-pink-500" fill="#ec4899" />
              Heart-Link Support Hub
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              You're not alone. These resources are here for you 24/7.
            </p>

            <div className="space-y-3">
              {crisisResources.map((resource) => {
                const Icon = resource.icon;
                return (
                  <a
                    key={resource.id}
                    href={resource.link}
                    target={resource.link.startsWith('http') ? '_blank' : undefined}
                    rel={resource.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={`block p-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${
                      resource.urgent ? 'ring-2 ring-red-300' : ''
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${resource.color.split(' ')[0].replace('from-', '')}20, ${resource.color.split(' ')[1]?.replace('to-', '')}10)`
                    }}
                    data-testid={`link-${resource.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className={`p-2 rounded-lg bg-gradient-to-r ${resource.color}`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                          {resource.name}
                          {resource.link.startsWith('http') && (
                            <ExternalLink className="w-3 h-3 opacity-50" />
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {resource.description}
                        </p>
                        <span className={`inline-block mt-2 text-xs font-bold px-2 py-1 rounded-full bg-gradient-to-r ${resource.color} text-white`}>
                          {resource.action}
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

            <div className="border-t pt-4 mt-4">
              <a
                href="https://www.allegacy.org/community"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-700"
                data-testid="link-wellness-fund"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                      Contribute to Student Wellness Fund
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-200">
                      Help support mental health resources for students
                    </p>
                  </div>
                </div>
              </a>
            </div>

            <div className="text-center pt-2 text-xs text-gray-500 dark:text-gray-400 border-t">
              <p>Proudly Funded by the</p>
              <p className="font-semibold text-amber-600 dark:text-amber-400">
                Allegacy Community Wellness Initiative
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsOpen(false)}
            data-testid="button-close-heart-link"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
