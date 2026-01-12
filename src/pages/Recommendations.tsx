import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ItemCard } from '@/components/ItemCard';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, Sparkles } from 'lucide-react';
import { recommendationsApi, itemsApi, getCurrentUserId } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const Recommendations = () => {
  const userId = getCurrentUserId();
  const queryClient = useQueryClient();
  
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['recommendations', userId],
    queryFn: () => recommendationsApi.getForUser(userId),
  });
  
  const toggleFavoriteMutation = useMutation({
    mutationFn: itemsApi.toggleFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      toast.success('Favorite updated');
    },
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" />
          For You
        </h1>
        <p className="text-muted-foreground mt-2">
          Personalized recommendations based on your interests and activity
        </p>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      ) : recommendations && recommendations.length > 0 ? (
        <div className="space-y-8">
          {recommendations.map((rec) => (
            <div key={rec.item.id} className="space-y-3">
              <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium">
                      {rec.reason}
                    </p>
                    <span className="ml-auto text-xs text-muted-foreground">
                      Match: {(rec.score * 100).toFixed(0)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ItemCard
                  item={rec.item}
                  onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto">
              <Lightbulb className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">No recommendations yet</h3>
              <p className="text-muted-foreground">
                Start exploring items and adding favorites to get personalized recommendations
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Recommendations;
