'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMentorshipAccess } from '@/middleware/withMentorshipAccess';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import RiskManagementModule from '@/mentorship/modules/risk';

export default function ModulePage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.moduleId as string;
  
  const { user, isLoading, hasAccess } = useMentorshipAccess({ 
    requiredRole: 'mentee',
    moduleId 
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasAccess) {
    // This will redirect via the hook
    return null;
  }

  const renderModule = () => {
    switch (moduleId) {
      case 'risk':
        return <RiskManagementModule />;
      case 'psychology':
        return (
          <div className="max-w-7xl mx-auto p-6">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold mb-4">Trading Psychology Module</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                This module is coming soon. Learn to master your emotions and build trading discipline.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg max-w-2xl mx-auto">
                <h3 className="font-semibold mb-2">What you'll learn:</h3>
                <ul className="text-left space-y-2 text-sm">
                  <li>• Emotional control techniques</li>
                  <li>• Building trading discipline</li>
                  <li>• Handling losses and drawdowns</li>
                  <li>• Developing consistent routines</li>
                  <li>• Managing FOMO and overtrading</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'smartmoney':
        return (
          <div className="max-w-7xl mx-auto p-6">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold mb-4">Smart Money Concepts</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Master institutional trading concepts and understand how the smart money moves.
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg max-w-2xl mx-auto">
                <h3 className="font-semibold mb-2">Advanced concepts covered:</h3>
                <ul className="text-left space-y-2 text-sm">
                  <li>• Order blocks and institutional levels</li>
                  <li>• Fair value gaps and imbalances</li>
                  <li>• Liquidity hunts and stop raids</li>
                  <li>• Market structure analysis</li>
                  <li>• Smart money vs retail patterns</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'signals':
        return (
          <div className="max-w-7xl mx-auto p-6">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold mb-4">Daily Signal Analysis</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Get daily trade setups with detailed analysis and screenshots.
              </p>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg max-w-2xl mx-auto">
                <h3 className="font-semibold mb-2">What's included:</h3>
                <ul className="text-left space-y-2 text-sm">
                  <li>• Daily trade setups with entry/exit points</li>
                  <li>• Detailed chart analysis and reasoning</li>
                  <li>• Risk management for each trade</li>
                  <li>• Real-time updates and follow-ups</li>
                  <li>• Weekly performance reviews</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'walkthroughs':
        return (
          <div className="max-w-7xl mx-auto p-6">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold mb-4">Live Trade Walkthroughs</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Watch step-by-step analysis of real trades from start to finish.
              </p>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg max-w-2xl mx-auto">
                <h3 className="font-semibold mb-2">In-depth coverage:</h3>
                <ul className="text-left space-y-2 text-sm">
                  <li>• Pre-market analysis and setup identification</li>
                  <li>• Live entry and exit decision making</li>
                  <li>• Trade management and position sizing</li>
                  <li>• Post-trade analysis and lessons learned</li>
                  <li>• Adapting to changing market conditions</li>
                </ul>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="max-w-7xl mx-auto p-6">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold mb-4">Module Not Found</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                The requested module could not be found.
              </p>
              <Button onClick={() => router.push('/mentorship')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/mentorship')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Module:</span>
              <span className="font-medium capitalize">{moduleId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Module Content */}
      <div className="py-8">
        {renderModule()}
      </div>
    </div>
  );
} 