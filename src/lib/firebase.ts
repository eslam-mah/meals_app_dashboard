
// Firebase configuration for notifications
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
  const serverKey = 'YOUR_FIREBASE_SERVER_KEY'; // You need to get this from Firebase Console > Project Settings > Cloud Messaging
  
  const payload = {
    registration_ids: tokens,
    notification: {
      title: title,
      body: body,
      icon: '/favicon.ico',
    },
    data: {
      click_action: 'FLUTTER_NOTIFICATION_CLICK',
    },
  };

  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${serverKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('FCM Response:', result);
    return result;
  } catch (error) {
    console.error('Error sending FCM notification:', error);
    throw error;
  }
};

export { firebaseConfig };
