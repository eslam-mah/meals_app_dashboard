
// Firebase configuration for HTTP v1 API notifications
const firebaseConfig = {
  apiKey: 'AIzaSyDQrPnLMCeMDKR9FvgMY_gNzuKFKQw-Sf4',
  appId: '1:425373195781:web:2bdc0dff008f39f529066c',
  messagingSenderId: '425373195781',
  projectId: 'food-app-99a54',
  authDomain: 'food-app-99a54.firebaseapp.com',
  storageBucket: 'food-app-99a54.firebasestorage.app',
  measurementId: 'G-BN69RC1G65',
};

export const sendFCMNotification = async (tokens: string[], title: string, body: string) => {
  try {
    console.log('Sending FCM notification via HTTP v1 API:', {
      tokenCount: tokens.length,
      title,
      body
    });

    // Call Supabase edge function for FCM HTTP v1 notifications
    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokens,
        title,
        body,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    console.log('FCM HTTP v1 Response:', result);
    
    // Return detailed results for better error handling
    return {
      success: result.success,
      total: result.total,
      successCount: result.success,
      failureCount: result.failures,
      results: result.results,
      message: result.message
    };
  } catch (error) {
    console.error('Error sending FCM HTTP v1 notification:', error);
    throw new Error(`Failed to send notification: ${error.message}`);
  }
};

export { firebaseConfig };
