import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { gamificationApi } from '@/lib/extendedApi';
import { getCurrentUserId } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Star, Lock } from 'lucide-react';
import { format } from 'date-fns';

const Achievements = () => {
  const userId = getCurrentUserId();

  const { data: progress, isLoading } = useQuery({
    queryKey: ['userProgress', userId],
    queryFn: () => gamificationApi.getUserProgress(userId),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!progress) return null;

  const levelProgress = (progress.totalPoints % 200) / 200 * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Achievements & Progress
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your gamification progress and unlock rewards
        </p>
      </div>

      {/* Level Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Level {progress.level}
            </CardTitle>
            <span className="text-2xl font-bold text-primary">{progress.totalPoints} pts</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {progress.level + 1}</span>
              <span>{Math.round(levelProgress)}%</span>
            </div>
            <Progress value={levelProgress} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {progress.pointsToNextLevel} points to next level
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-primary">{progress.stats.itemsCreated}</div>
            <div className="text-sm text-muted-foreground mt-1">Items Created</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-primary">{progress.stats.commentsPosted}</div>
            <div className="text-sm text-muted-foreground mt-1">Comments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-primary">{progress.stats.likesGiven}</div>
            <div className="text-sm text-muted-foreground mt-1">Likes Given</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-primary">{progress.stats.itemsViewed}</div>
            <div className="text-sm text-muted-foreground mt-1">Items Viewed</div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Achievements</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {progress.achievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={achievement.unlocked ? 'border-primary/30' : 'opacity-60'}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">
                    {achievement.unlocked ? achievement.icon : <Lock className="w-10 h-10 text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {achievement.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-primary">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-semibold">{achievement.points}</span>
                      </div>
                    </div>
                    {achievement.unlocked && achievement.unlockedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Unlocked {format(new Date(achievement.unlockedAt), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Achievements;
