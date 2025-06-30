
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase, NotificationToken } from '@/lib/supabase';
import { sendFCMNotification } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bell, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

const NotificationsPage = () => {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const { data: tokens, isLoading } = useQuery({
    queryKey: ['notificationTokens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_tokens')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as NotificationToken[];
    },
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async () => {
      if (!tokens || tokens.length === 0) {
        throw new Error('No notification tokens found');
      }

      const tokenList = tokens.map(token => token.token);
      
      try {
        const result = await sendFCMNotification(tokenList, title, body);
        return result;
      } catch (error) {
        console.error('Failed to send FCM notification:', error);
        throw new Error('Failed to send notification via HTTP v1 API: ' + error.message);
      }
    },
    onSuccess: (result) => {
      const { successCount, failureCount, total } = result;
      
      if (successCount === total) {
        toast.success(t('notification_sent_success_all').replace('{count}', total.toString()));
      } else if (successCount > 0) {
        toast.success(t('notification_sent_success_partial').replace('{success}', successCount.toString()).replace('{total}', total.toString()).replace('{failed}', failureCount.toString()));
      } else {
        toast.error(t('notification_sent_failed_all').replace('{count}', total.toString()));
      }
      
      if (successCount > 0) {
        setTitle('');
        setBody('');
      }
    },
    onError: (error) => {
      toast.error(t('notification_send_error') + ': ' + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error(t('notification_form_validation'));
      return;
    }
    sendNotificationMutation.mutate();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">{t('loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('send_notifications')}</h1>
        <div className="flex items-center text-gray-600">
          <Bell className="h-5 w-5 mr-2" />
          <span>{tokens?.length || 0} {t('active_devices')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notification Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="h-5 w-5 mr-2" />
                {t('compose_notification')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">{t('notification_title')}</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('notification_title_placeholder')}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="body">{t('notification_body')}</Label>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={t('notification_body_placeholder')}
                    className="min-h-[100px]"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={sendNotificationMutation.isPending}
                >
                  {sendNotificationMutation.isPending ? (
                    t('sending_notification')
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {t('send_to_devices').replace('{count}', (tokens?.length || 0).toString())}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Active Tokens Overview */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{t('active_devices')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{t('total_devices')}:</span>
                  <span className="font-semibold">{tokens?.length || 0}</span>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">{t('platform_breakdown')}:</h4>
                  {tokens && (
                    <div className="space-y-1">
                      {['android', 'ios', 'web'].map(platform => {
                        const count = tokens.filter(token => token.platform === platform).length;
                        return count > 0 && (
                          <div key={platform} className="flex justify-between text-sm">
                            <span className="capitalize text-gray-600">{platform}:</span>
                            <span>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {tokens && tokens.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      {t('notification_info_message')}
                    </p>
                  </div>
                )}

                {(!tokens || tokens.length === 0) && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      {t('no_devices_message')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview */}
      {(title || body) && (
        <Card>
          <CardHeader>
            <CardTitle>{t('notification_preview')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Android Preview */}
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Android</h4>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <h5 className="font-semibold text-gray-900 mb-1">
                    {title || t('notification_preview_title')}
                  </h5>
                  <p className="text-sm text-gray-600">
                    {body || t('notification_preview_body')}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Food App • {t('now')}</p>
                </div>
              </div>
              
              {/* iOS Preview */}
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-600 mb-2">iOS</h4>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <h5 className="font-semibold text-gray-900 mb-1">
                    {title || t('notification_preview_title')}
                  </h5>
                  <p className="text-sm text-gray-600">
                    {body || t('notification_preview_body')}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Food App • {t('now')}</p>
                </div>
              </div>
              
              {/* Web Preview */}
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Web</h4>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <h5 className="font-semibold text-gray-900 mb-1">
                    {title || t('notification_preview_title')}
                  </h5>
                  <p className="text-sm text-gray-600">
                    {body || t('notification_preview_body')}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Food App • {t('now')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationsPage;
