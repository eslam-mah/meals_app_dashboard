
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
    const response = await fetch('https://bklaalgiadeapphjlpra.supabase.co/functions/v1/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrbGFhbGdpYWRlYXBwaGpscHJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NDk5NDYsImV4cCI6MjA2NTAyNTk0Nn0.8Nhtv0krtfJfYCuiNgrceGzCyxe4JOaG25RMo2tpmuU'
      },
      body: JSON.stringify({
        tokens,
        title,
        body,
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge function error response:', errorText);
      throw new Error(`Edge function error! status: ${response.status}, message: ${errorText}`);
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
    
    // Enhanced error logging
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Network error - possible causes:');
      console.error('1. Edge function not deployed');
      console.error('2. CORS issues');
      console.error('3. Network connectivity problems');
      console.error('4. Edge function runtime error');
      
      throw new Error('Network error: The edge function may not be deployed or accessible. Please check your Supabase project.');
    }
    
    throw new Error(`Failed to send notification: ${error.message}`);
  }
};

export { firebaseConfig };
