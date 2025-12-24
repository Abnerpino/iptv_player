import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RealmProvider, useQuery } from "@realm/react";
import FlashMessage from "react-native-flash-message";
import SystemNavigationBar from "react-native-system-navigation-bar";
import { getMessaging, onMessage, requestPermission, getToken, onTokenRefresh } from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNRestart from 'react-native-restart';
import { useStreaming } from "./services/hooks/useStreaming"
import { actualizarCliente } from "./services/controllers/hostingController";
import ErrorLogger from "./services/logger/errorLogger";
import Inicio from "./screens/Inicio";
import Activation from "./screens/Activation";
import Menu from "./screens/Menu";
import About from "./screens/About";
import SpeedTest from "./screens/SpeedTest";
import Seccion from "./screens/Seccion";
import Canal from "./screens/Canal";
import Pelicula from "./screens/Pelicula";
import Serie from "./screens/Serie";
import {
  UsuarioSchema,
  NotificacionSchema,
  CanalSchema,
  PeliculaSchema,
  SerieSchema,
  EpisodioSchema,
  TemporadaSchema,
  CatsLiveSchema,
  CatsVodSchema,
  CatsSerieSchema
} from "./services/schemas/schemasStreaming";

const Stack = createNativeStackNavigator();

// Componente hijo que tiene acceso a Realm
const AppContent = () => {
  const usuario = useQuery('Usuario');
  const { updateUserProps, deleteUser } = useStreaming();

  // Configuración del 'Listener' de solicitudes remotas
  useEffect(() => {
    const setupFCM = async () => {
      const messaging = getMessaging(); // Obtiene la instancia
      // Variables para guardar las funciones de limpieza
      let unsubscribeTokenRefresh = () => { };
      let unsubscribeOnMessage = () => { };

      try {
        // Solicita permisos (necesario en Android +13)
        await requestPermission(messaging);
        // Obtiene el token FCM
        const token = await getToken(messaging);

        // Si ya existe el usuario en el dispositivo...
        if (usuario[0]) {
          // Recupera la indicación para borrar el usuario
          const cleanUser = await AsyncStorage.getItem('account_deleted');

          // Si existe la indicación...
          if (cleanUser) {
            deleteUser(usuario[0]?.device_id); // Elimina el usuario
            AsyncStorage.removeItem('account_deleted'); // Invalida la indicación que borra el usuario
            AsyncStorage.removeItem('last_user_sync'); // Invalida la caché para que la proxima vez que se inicie la app, cosulte la nube
          } else { // Si no existe la indicación...
            // Obtiene el token FCM guardado localmente
            const savedToken = usuario[0]?.fcm_token;

            // Si el token es válido y es diferente al token generado...
            if (savedToken && savedToken !== token) {
              await actualizarCliente(usuario[0]?.id, { fcm_token: token }); // Actualiza el token en la Base de Datos de la Nube
              updateUserProps(usuario[0]?.device_id, { fcm_token: token }); // Actualiza el token en la Base de Datos Local
            }
          }
        }

        // Escucha si el token cambia
        unsubscribeTokenRefresh = onTokenRefresh(messaging, async (token) => {
          // Si ya existe el usuario en el dispositivo...
          if (usuario[0]) {
            // Recupera la indicación para borrar el usuario
            const cleanUser = await AsyncStorage.getItem('account_deleted');

            // Si existe la indicación...
            if (cleanUser) {
              deleteUser(usuario[0]?.device_id); // Elimina el usuario
              AsyncStorage.removeItem('account_deleted'); // Invalida la indicación que borra el usuario
              AsyncStorage.removeItem('last_user_sync'); // Invalida la caché para que la proxima vez que se inicie la app, cosulte la nube
            } else { // Si no existe la indicación...
              // Obtiene el token FCM guardado localmente
              const savedToken = usuario[0]?.fcm_token;

              // Si el token es válido y es diferente al token generado...
              if (savedToken && savedToken !== token) {
                await actualizarCliente(usuario[0]?.id, { fcm_token: token }); // Actualiza el token en la Base de Datos de la Nube
                updateUserProps(usuario[0]?.device_id, { fcm_token: token }); // Actualiza el token en la Base de Datos Local
              }
            }
          }
        });
      } catch (error) {
        ErrorLogger.log('App - setupFCM', error);
      }

      // Escucha mensajes en primer plano, es decir, cuando la app está abierta (Foreground)
      unsubscribeOnMessage = onMessage(messaging, async (remoteMessage) => {
        console.log('FCM Message recibido en primer plano:', remoteMessage);
        const action = remoteMessage.data?.action;
        const reason = remoteMessage.data?.reason;

        switch (action) {
          case 'refresh_user_data': // Si recibe el aviso de que se actualizó la información del usuario en la nube...
            await AsyncStorage.removeItem('last_user_sync'); // Invalida la caché para que la proxima vez que se inicie la app, cosulte la nube
            console.log('Caché invalidada por solicitud remota.');
            break;
          case 'erase_user_data': // Si recibe el aviso de que se eliminó la información del usuario en la nube...
            await AsyncStorage.setItem('account_deleted', reason); // Establece la "razón" para que la proxima vez que se inicie la app, se elimine el usuario
            console.log(`Razón "${reason}" establecida por solicitud remota.`)
          default:
            break;
        }

        // Si la actualización es porque ya expiró la cuenta...
        if (reason === 'account_expired') {
          RNRestart.restart(); // Reinicia la app para aplicar los cambios inmediatamente
        }
      });

      // Retorna una función de limpieza unificada
      return () => {
        unsubscribeTokenRefresh(); // Deja de escuchar cambios de token
        unsubscribeOnMessage();    // Deja de escuchar mensajes
      };
    };

    // Ejecuta la función asíncrona
    const unsubscribePromise = setupFCM();

    // Limpieza del useEffect principal
    return () => {
      unsubscribePromise.then(unsub => unsub && unsub());
    };
  }, []);

  // Configuración de modo inmersivo al iniciar la app
  useEffect(() => {
    // Activa el modo inmersivo (oculta status bar y navigation bar)
    SystemNavigationBar.immersive();
    /// Permite que el contenido de la app ocupe el espacio DETRÁS de la barra
    SystemNavigationBar.setNavigationColor('transparent');
    // Evita que Android ponga un fondo semitransparente oscuro automáticamente
    SystemNavigationBar.setNavigationBarContrastEnforced(false);
    // La barra estará oculta, pero cuando el teclado la fuerce a aparecer, será transparente
    SystemNavigationBar.navigationHide();
    // Asegura que se mantenga oculta aunque se toque la pantalla (Sticky)
    SystemNavigationBar.stickyImmersive();
  }, []);

  return (
    <>
      <StatusBar hidden={true} />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Inicio" component={Inicio} />
          <Stack.Screen name="Activation" component={Activation} />
          <Stack.Screen name="Menu" component={Menu} />
          <Stack.Screen name="About" component={About} />
          <Stack.Screen name="SpeedTest" component={SpeedTest} />
          <Stack.Screen name="Seccion" component={Seccion} />
          <Stack.Screen name="Canal" component={Canal} />
          <Stack.Screen name="Pelicula" component={Pelicula} />
          <Stack.Screen name="Serie" component={Serie} />
        </Stack.Navigator>
      </NavigationContainer>
      <FlashMessage position='top' />
    </>
  );
};

// Componente principal
const App = () => {
  return (
    <RealmProvider
      schema={[
        UsuarioSchema,
        NotificacionSchema,
        CanalSchema,
        PeliculaSchema,
        SerieSchema,
        EpisodioSchema,
        TemporadaSchema,
        CatsLiveSchema,
        CatsVodSchema,
        CatsSerieSchema
      ]}
    >
      <AppContent />
    </RealmProvider>
  );
}

export default App;