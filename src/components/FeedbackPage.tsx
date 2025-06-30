import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Feedback, User } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ThumbsUp, ThumbsDown, User as UserIcon, Trash } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

const FeedbackPage = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  
  const { data: feedbacks, isLoading } = useQuery({
    queryKey: ['feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          users (
            id,
            name,
            email,
            phone_number,
            city,
            location
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as (Feedback & { users: User })[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (feedbackId: string) => {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', feedbackId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success(t('feedback_deleted'));
    },
    onError: (error) => {
      toast.error(t('error_deleting_feedback') + ': ' + error.message);
    },
  });

  const handleDelete = (feedbackId: string) => {
    if (window.confirm(t('confirm_delete_feedback'))) {
      deleteMutation.mutate(feedbackId);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAverageRating = (feedback: Feedback) => {
    return ((feedback.rating1 + feedback.rating2 + feedback.rating3) / 3).toFixed(1);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">{t('loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('customer_feedback')}</h1>
        <div className="text-gray-600">
          {t('total_reviews')}: {feedbacks?.length || 0}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {feedbacks?.map((feedback) => (
          <Card key={feedback.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <UserIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {feedback.users?.name || t('anonymous')}
                    </h3>
                    <p className="text-sm text-gray-600">{feedback.phone_number}</p>
                    {feedback.users?.city && (
                      <p className="text-sm text-gray-500">{feedback.users.city}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {new Date(feedback.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className={`text-lg font-bold ${getRatingColor(parseFloat(getAverageRating(feedback)))}`}>
                      {getAverageRating(feedback)}
                    </span>
                    <div className="flex ml-2">
                      {renderStars(Math.round(parseFloat(getAverageRating(feedback))))}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Individual Ratings */}
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('food_quality')}:</span>
                  <div className="flex items-center">
                    <div className="flex mr-2">
                      {renderStars(feedback.rating1)}
                    </div>
                    <Badge variant="outline">{feedback.rating1}/5</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('service_speed')}:</span>
                  <div className="flex items-center">
                    <div className="flex mr-2">
                      {renderStars(feedback.rating2)}
                    </div>
                    <Badge variant="outline">{feedback.rating2}/5</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('ease_of_ordering')}:</span>
                  <div className="flex items-center">
                    <div className="flex mr-2">
                      {renderStars(feedback.rating3)}
                    </div>
                    <Badge variant="outline">{feedback.rating3}/5</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('overall_satisfaction')}:</span>
                  <div className="flex items-center">
                    {feedback.overall_rate === 1 ? (
                      <ThumbsUp className="h-5 w-5 text-green-600 mr-2" />
                    ) : (
                      <ThumbsDown className="h-5 w-5 text-red-600 mr-2" />
                    )}
                    <Badge variant={feedback.overall_rate === 1 ? 'default' : 'destructive'}>
                      {feedback.overall_rate === 1 ? t('like') : t('dislike')}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Comment */}
              {feedback.comment && (
                <div className="border-t pt-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">{t('comment')}:</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg italic">
                    "{feedback.comment}"
                  </p>
                </div>
              )}
              
              {/* Delete Button */}
              <div className="flex justify-end pt-2">
                <Button
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(feedback.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash className="h-4 w-4 mr-1" />
                  {t('delete')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {feedbacks && feedbacks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{t('no_feedback_yet')}</p>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
