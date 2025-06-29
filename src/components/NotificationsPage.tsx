
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase, NotificationToken } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bell, Send, Image } from 'lucide-react';
import { toast } from 'sonner';

const NotificationsPage = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

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

  const uploadNotificationImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('notification-pics')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('notification-pics')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const sendNotificationMutation = useMutation({
    mutationFn: async () => {
      if (!tokens || tokens.length === 0) {
        throw new Error('No notification tokens found');
      }

      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadNotificationImage(imageFile);
      }

      // Here you would typically call your backend API to send FCM notifications
      // For now, we'll simulate the notification sending
      const notificationData = {
        title,
        body,
        image: imageUrl,
        tokens: tokens.map(token => token.token),
      };

      console.log('Sending notification to tokens:', notificationData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return notificationData;
    },
    onSuccess: () => {
      toast.success(`Notification sent to ${tokens?.length || 0} devices!`);
      setTitle('');
      setBody('');
      setImageFile(null);
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

                <div>
                  <Label htmlFor="image" className="flex items-center">
                    <Image className="h-4 w-4 mr-2" />
                    Notification Image (Optional)
                  </Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                  {imageFile && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {imageFile.name}
                    </p>
                  )}
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
                {imageFile && (
                  <div className="mb-2">
                    <img 
                      src={URL.createObjectURL(imageFile)} 
                      alt="Preview" 
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                )}
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
