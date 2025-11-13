import React from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RealmProvider } from "@realm/react";
import FlashMessage from "react-native-flash-message";
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
      <StatusBar hidden />
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
    </RealmProvider>
  );
}

export default App;