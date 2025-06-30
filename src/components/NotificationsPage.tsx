
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase, NotificationToken } from '@/lib/supabase';
import { sendFCMNotification } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bell, Send, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const NotificationsPage = () => {
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
        throw new Error('Failed to send notification. Please check your Firebase server key configuration.');
      }
    },
    onSuccess: () => {
      toast.success(`Notification sent to ${tokens?.length || 0} devices!`);
      setTitle('');
      setBody('');
    },
    onError: (error) => {
      toast.error('Failed to send notification: ' + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error('Please fill in both title and body');
      return;
    }
    sendNotificationMutation.mutate();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Send Notifications</h1>
        <div className="flex items-center text-gray-600">
          <Bell className="h-5 w-5 mr-2" />
          <span>{tokens?.length || 0} Active Devices</span>
        </div>
      </div>

      {/* Firebase Configuration Warning */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center text-yellow-800">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Firebase Configuration Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-yellow-700 text-sm space-y-2">
            <p>To send notifications, you need to:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Go to Firebase Console → Project Settings → Cloud Messaging</li>
              <li>Copy your Server Key</li>
              <li>Replace 'YOUR_FIREBASE_SERVER_KEY' in src/lib/firebase.ts with your actual server key</li>
            </ol>
            <p className="mt-2">
              <strong>Your Project ID:</strong> food-app-99a54
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notification Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="h-5 w-5 mr-2" />
                Compose Notification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Notification Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter notification title..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="body">Notification Body</Label>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Enter notification message..."
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
                    'Sending...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send to {tokens?.length || 0} Devices
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
              <CardTitle>Active Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Devices:</span>
                  <span className="font-semibold">{tokens?.length || 0}</span>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">Platform Breakdown:</h4>
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
                      Your notification will be sent to all active devices. 
                      Make sure your message is clear and engaging!
                    </p>
                  </div>
                )}

                {(!tokens || tokens.length === 0) && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      No active devices found. Users need to enable notifications 
                      in the mobile app first.
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
            <CardTitle>Notification Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-lg max-w-sm">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {title || 'Notification Title'}
                </h4>
                <p className="text-sm text-gray-600">
                  {body || 'Notification body will appear here...'}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Food App • now
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationsPage;
