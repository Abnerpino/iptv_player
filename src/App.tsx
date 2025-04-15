import React from "react";
import Login from "./screens/Login";
import Menu from "./screens/Menu";
import About from "./screens/About";
import SpeedTest from "./screens/SpeedTest";
import Seccion from "./screens/Seccion";
import Pelicula from "./screens/Pelicula";
import Serie from "./screens/Serie";
import Reproductor from "./screens/Reproductor";
import { StatusBar } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from "./services/redux/store";

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <Provider store={store}>
      <StatusBar hidden />
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/*<Stack.Screen name="Login" component={Login} />*/}
            <Stack.Screen name="Menu" component={Menu} />
            <Stack.Screen name="About" component={About} />
            <Stack.Screen name="SpeedTest" component={SpeedTest} />
            <Stack.Screen name="Seccion" component={Seccion} />
            <Stack.Screen name="Pelicula" component={Pelicula} />
            <Stack.Screen name="Serie" component={Serie} />
            <Stack.Screen name="Reproductor" component={Reproductor}/>
          </Stack.Navigator>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}

export default App;