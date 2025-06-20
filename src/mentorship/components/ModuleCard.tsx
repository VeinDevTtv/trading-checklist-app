'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Video, BookOpen, Lock, CheckCircle } from 'lucide-react';

interface ModuleCardProps {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoCount: number;
  progress: number;
  isLocked: boolean;
  isCompleted: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  thumbnail?: string;
  onAccess: (moduleId: string) => void;
  className?: string;
}

export function ModuleCard({
  id,
  title,
  description,
  duration,
  videoCount,
  progress,
  isLocked,
  isCompleted,
  difficulty,
  tags,
  thumbnail,
  onAccess,
  className = ''
}: ModuleCardProps) {
  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleAccess = () => {
    if (!isLocked) {
      onAccess(id);
    }
  };

  return (
    <Card className={`w-full transition-all duration-200 hover:shadow-md ${isLocked ? 'opacity-60' : 'hover:shadow-lg'} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{title}</CardTitle>
              {isCompleted && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              {isLocked && (
                <Lock className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <Badge className={getDifficultyColor()}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Badge>
          </div>
          {thumbnail && (
            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img 
                src={thumbnail} 
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          {description}
        </p>
        
        {/* Module Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {duration}
          </div>
          <div className="flex items-center gap-1">
            <Video className="h-4 w-4" />
            {videoCount} videos
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            Course
          </div>
        </div>

        {/* Progress Bar */}
        {!isLocked && progress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Action Button */}
        <Button 
          onClick={handleAccess}
          disabled={isLocked}
          className="w-full"
          variant={isLocked ? "secondary" : "default"}
        >
          {isLocked ? (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Unlock Required
            </>
          ) : isCompleted ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Review Module
            </>
          ) : progress > 0 ? (
            'Continue Learning'
          ) : (
            'Start Module'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// Simplified locked module card for access denied scenarios
interface LockedModuleCardProps {
  title: string;
  description: string;
  features: string[];
  className?: string;
}

export function LockedModuleCard({ 
  title, 
  description, 
  features,
  className = '' 
}: LockedModuleCardProps) {
  return (
    <Card className={`w-full border-2 border-dashed border-gray-300 dark:border-gray-700 ${className}`}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
            <Lock className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <CardTitle className="text-gray-600 dark:text-gray-400">{title}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-500 dark:text-gray-500 text-sm text-center">
          {description}
        </p>
        
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
              <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              {feature}
            </div>
          ))}
        </div>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => window.location.href = '/mentorship-access-denied'}
        >
          Get Access
        </Button>
      </CardContent>
    </Card>
  );
}

// Module grid component
interface ModuleGridProps {
  modules: ModuleCardProps[];
  className?: string;
}

export function ModuleGrid({ modules, className = '' }: ModuleGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {modules.map((module) => (
        <ModuleCard key={module.id} {...module} />
      ))}
    </div>
  );
} 