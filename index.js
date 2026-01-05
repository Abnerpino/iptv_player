/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from './src/App';
import { name as appName } from './app.json';

// Manejador de eventos de fondo (si el usuario toca la notificación)
notifee.onBackgroundEvent(async ({ type, detail }) => {
    const { notification } = detail;

    // Si el usuario presiona la notificación antes de que se borre...
    if (type === EventType.PRESS) {
        // La borra inmediatamente y abre la app
        if (notification?.id) {
            await notifee.cancelNotification(notification.id);
        }
    }
});

const messaging = getMessaging();

// Escucha mensajes en segundo plano o cuando la app está cerrada (Background)
setBackgroundMessageHandler(messaging, async (remoteMessage) => {
    console.log('Mensaje recibido en Background!', remoteMessage);
    const action = remoteMessage.data?.action;
    const reason = remoteMessage.data?.reason;

    switch (action) {
        case 'create_client_account':
            await AsyncStorage.setItem('firestore_client_id', reason);
            console.log('Id del cliente recibido por solicitud remota.');
            break;
        case 'refresh_user_data': // Si recibe el aviso de que se actualizó la información del usuario en la nube...
            await AsyncStorage.removeItem('last_user_sync'); // Invalída la caché para que la proxima vez que se inicie la app, cosulte la nube
            console.log('Caché invalidada por solicitud remota.');
            break;
        case 'erase_user_data': // Si recibe el aviso de que se eliminó la información del usuario en la nube...
            await AsyncStorage.setItem('account_deleted', reason); // Establece la "razón" para que la proxima vez que se inicie la app, se elimine el usuario
            console.log(`Razón "${reason}" establecida por solicitud remota.`);
            break;
        case 'refresh_user_notifications': // Si recibe el aviso de que se actualizaron las notificaiones del usuario en la nube...
            await AsyncStorage.removeItem('last_notifications_sync'); // Invalída la caché para que la proxima vez que se inicie la app, cosulte la nube
            console.log('Caché de Notificaciones invalidada por solicitud remota.');
            break;
        default:
            break;
    }

    // Crea el canal de notificación
    const channelId = await notifee.createChannel({
        id: 'sync_channel',
        name: 'Sincronización de Datos',
        importance: AndroidImportance.MIN,
    });

    // Muestra la notificación para satisfacer la regla de Android para mensajes de Alta Prioridad
    const notificationId = await notifee.displayNotification({
        title: 'Actualizando contenido...',
        body: 'Sincronizando la información más reciente.',
        android: {
            channelId,
            smallIcon: 'ic_launcher',
            pressAction: {
                id: 'default',
            },
        },
    });

    // Elimina la notificación de la barra de estado
    await new Promise(resolve => setTimeout(resolve, 2000));
    await notifee.cancelNotification(notificationId);
});

AppRegistry.registerComponent(appName, () => App);
