import React from "react";
import Inicio from "./screens/Inicio";
import Activation from "./screens/Activation";
import Menu from "./screens/Menu";
import About from "./screens/About";
import SpeedTest from "./screens/SpeedTest";
import Seccion from "./screens/Seccion";
import Canal from "./screens/Canal";
import Pelicula from "./screens/Pelicula";
import Serie from "./screens/Serie";
import FlashMessage from "react-native-flash-message";
import { StatusBar } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from "./services/redux/store";
import { RealmProvider } from "@realm/react";
import { CanalSchema, PeliculaSchema, SerieSchema, EpisodioSchema, TemporadaSchema, CatsLiveSchema, CatsVodSchema, CatsSerieSchema } from "./services/schemas/schemasStreaming";

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <RealmProvider
      schema={[
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
      <Provider store={store}>
        <StatusBar hidden />
        <PersistGate loading={null} persistor={persistor}>
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
        </PersistGate>
        <FlashMessage position='top' />
      </Provider>
    </RealmProvider>
  );
}

export default App;