'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ModuleGrid } from '@/mentorship/components/ModuleCard';
import { useMentorshipAccess } from '@/middleware/withMentorshipAccess';
import { YouTubeAuthManager } from '@/utils/youtubeAuth';
import { 
  GraduationCap, 
  TrendingUp, 
  Brain, 
  Target, 
  Shield, 
  Video,
  User,
  LogOut,
  Settings,
  BookOpen
} from 'lucide-react';

export default function MentorshipDashboard() {
  const { user, isLoading, hasAccess } = useMentorshipAccess({ requiredRole: 'mentee' });
  const [authManager] = useState(() => YouTubeAuthManager.getInstance());
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authManager.signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleModuleAccess = (moduleId: string) => {
    router.push(`/mentorship/modules/${moduleId}`);
  };

  // Mock progress data - in production, this would come from user progress tracking
  const userProgress = {
    totalModules: 5,
    completedModules: 1,
    totalVideos: 25,
    watchedVideos: 8,
    streakDays: 7
  };

  const modules = [
    {
      id: 'risk',
      title: 'Risk Management',
      description: 'Master position sizing, stop losses, and portfolio risk. The foundation of profitable trading.',
      duration: '2 hours',
      videoCount: 4,
      progress: 75,
      isLocked: false,
      isCompleted: false,
      difficulty: 'beginner' as const,
      tags: ['Essential', 'Position Sizing', 'Stop Loss'],
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      onAccess: handleModuleAccess
    },
    {
      id: 'psychology',
      title: 'Trading Psychology',
      description: 'Develop the mental edge needed for consistent trading performance. Control emotions and build discipline.',
      duration: '3 hours',
      videoCount: 6,
      progress: 0,
      isLocked: false,
      isCompleted: false,
      difficulty: 'intermediate' as const,
      tags: ['Psychology', 'Discipline', 'Emotions'],
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      onAccess: handleModuleAccess
    },
    {
      id: 'smartmoney',
      title: 'Smart Money Concepts',
      description: 'Understand institutional trading patterns, order blocks, and fair value gaps for better entries.',
      duration: '4 hours',
      videoCount: 8,
      progress: 0,
      isLocked: false,
      isCompleted: false,
      difficulty: 'advanced' as const,
      tags: ['ICT', 'Order Blocks', 'FVG', 'Liquidity'],
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      onAccess: handleModuleAccess
    },
    {
      id: 'signals',
      title: 'Daily Signal Analysis',
      description: 'Daily trade setups with detailed analysis, screenshots, and rationale behind each trade.',
      duration: 'Daily',
      videoCount: 30,
      progress: 25,
      isLocked: false,
      isCompleted: false,
      difficulty: 'intermediate' as const,
      tags: ['Signals', 'Analysis', 'Live Trades'],
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      onAccess: handleModuleAccess
    },
    {
      id: 'walkthroughs',
      title: 'Live Trade Walkthroughs',
      description: 'Step-by-step analysis of real trades from entry to exit with detailed explanations.',
      duration: '5 hours',
      videoCount: 12,
      progress: 0,
      isLocked: false,
      isCompleted: false,
      difficulty: 'advanced' as const,
      tags: ['Live Trading', 'Analysis', 'Real Examples'],
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      onAccess: handleModuleAccess
    }
  ];

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Trading Mentorship
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Welcome back, {user?.name || 'Trader'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user?.role}</span>
                <Badge className={user?.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {user?.subscriptionStatus}
                </Badge>
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userProgress.completedModules}/{userProgress.totalModules}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Modules Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Video className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userProgress.watchedVideos}/{userProgress.totalVideos}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Videos Watched</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userProgress.streakDays}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {Math.round((userProgress.completedModules / userProgress.totalModules) * 100)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Learning Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round((userProgress.completedModules / userProgress.totalModules) * 100)}%</span>
              </div>
              <Progress 
                value={(userProgress.completedModules / userProgress.totalModules) * 100} 
                className="h-3"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You&apos;ve completed {userProgress.completedModules} out of {userProgress.totalModules} modules. 
                Keep up the great work!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/mentorship/modules/risk')}>
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 text-red-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Continue Risk Management</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                75% complete • 1 video remaining
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/mentorship/modules/signals')}>
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Today&apos;s Signals</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                3 new trade setups available
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/mentorship/modules/psychology')}>
            <CardContent className="p-6 text-center">
              <Brain className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Start Psychology Module</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Build your mental edge
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Modules Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            All Modules
          </h2>
          <ModuleGrid modules={modules} />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Video className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium">Completed: Position Sizing Strategies</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Risk Management Module • 2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium">Started: Risk Management Fundamentals</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Risk Management Module • Yesterday</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Target className="h-5 w-5 text-orange-600" />
                <div className="flex-1">
                  <p className="font-medium">New signal: EUR/USD Long Setup</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Daily Signals • 3 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 