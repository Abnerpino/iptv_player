import React, { useEffect, useRef, useState } from 'react';
import { Animated, ImageBackground, View, BackHandler } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import NetInfo from '@react-native-community/netinfo';
import RNRestart from 'react-native-restart';
import RNExitApp from 'react-native-exit-app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@realm/react';
import { useXtream } from '../../services/hooks/useXtream';
import { useStreaming } from '../../services/hooks/useStreaming';
import { getMessaging, getToken } from '@react-native-firebase/messaging';
import { verificarCliente, obtenerNotificaciones } from '../../services/controllers/hostingController';
import ModalConfirmation from '../../components/Modals/modal_confirmation';
import ErrorLogger from '../../services/logger/errorLogger';

const Inicio = ({ navigation }) => {
    const { getInfoAccount } = useXtream();
    const { createUser, upsertNotifications, updateUserProps } = useStreaming();
    const usuario = useQuery('Usuario');
    const messaging = getMessaging();
    const [modalVisible, setModalVisible] = useState(false); //Estado para manejar el modal de confirmación
    const [errorId, setErrorId] = useState(3); //Estado para manejar el tipo de error (por defecto 3)

    // Valor de animación de opacidad, comienza en 0 (transparente)
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Función auxiliar para verificar la conexión a internet
    const checkInternetConnection = async () => {
        // Primer intento
        let netState = await NetInfo.fetch();

        // Si el valor es null (desconocido), reintenta unas cuantas veces
        let intentos = 0;
        while (netState.isInternetReachable === null && intentos < 5) {
            // Esperam 200ms entre intentos (máximo 1 segundo total)
            await new Promise(resolve => setTimeout(resolve, 200));
            netState = await NetInfo.fetch();
            intentos++;
        }

        // Devuelve el estado final
        return netState.isConnected && (netState.isInternetReachable ?? false);
    };

    useEffect(() => {
        // Inicia animación de opacidad (fade-in) al montar el componente
        Animated.timing(fadeAnim, {
            toValue: 1,              // opacidad final (100%)
            duration: 500,           // duración de la animación: 0.5 segundos
            useNativeDriver: true,
        }).start();

        let isRequestDone = false;     // bandera para saber si la petición terminó
        let isDelayDone = false;       // bandera para saber si ya pasaron los 1.5 segundos
        let result = {
            numId: -1,
            data: null
        };  // almacena el resultado de la petición

        // Simula el retraso mínimo de 1.5 segundos antes de permitir navegación
        const delay = new Promise(resolve => setTimeout(() => {
            isDelayDone = true;         // marca que el tiempo ya pasó
            resolve();
        }, 1500));

        const saveLastUpdateTime = async () => {
            try {
                const savedTime = await AsyncStorage.getItem('@last_update_time_iptv');
                if (savedTime !== null) {
                    console.log('Tiempo existente');
                } else {
                    const now = new Date().getTime();
                    const newTime = now - 86400000; // Se restan 24 horas al tiempo actual para forzar la actualización la primera vez
                    await AsyncStorage.setItem('@last_update_time_iptv', newTime.toString());
                    console.log('Tiempo guardado');
                }
            } catch (e) {
                ErrorLogger.log('Inicio - saveLastUpdateTime', e);
                //console.error("Error al guardar el tiempo de actualización", e);
            }
        };

        saveLastUpdateTime();

        // Ejecuta la petición asíncrona
        const request = async () => {
            try {
                // Verifica primero si hay conexión a internet antes de realizar la petición
                const hasInternet = await checkInternetConnection();

                // Si no hay internet, define numId en 0 y sale
                if (!hasInternet) {
                    result = { numId: 0, data: null };
                    isRequestDone = true;
                    return;
                }

                // Si hay internet, procede con la lógica normal
                const deviceId = await DeviceInfo.getUniqueId();
                console.log('deviceId: ', deviceId);
                const response = await verificarCliente(deviceId);
                result = response; // guarda el resultado de la petición

                // Si todavía no existe localmente el usuario, lo crea
                if (!usuario[0]) {
                    const token = await getToken(messaging); // Obtiene el token FCM

                    const newUser = {
                        id: '',
                        device_id: deviceId,
                        fcm_token: token,
                        client_name: '',
                        username: '',
                        user: '',
                        password: '',
                        host: '',
                        is_registered: false,
                        is_active: false,
                        expiration_date: '',
                        purchased_package: '',
                        device_model: DeviceInfo.getModel(),
                        android_version: DeviceInfo.getSystemVersion()
                    }

                    createUser(newUser);
                }

                // Si el usuario no existe en la nube...
                if (response.numId === 1) {
                    // Actualiza como 'no registrado' el dispositivo por si el usuario ya existiera localmente
                    updateUserProps(deviceId, { is_registered: false });
                }

                // Si el usuario ya existe en la nube...
                if (response.numId === 2) {
                    //await getInfoAccount();
                    const info = response.data;
                    // Si la bandera de sincronización no está activa...
                    if (!info.sync) {
                        result = { numId: 2, data: null };
                        return;
                    }
                    // Si la cuenta del usuario está activa...
                    if (info.active) {
                        const notifications = await obtenerNotificaciones(info.id);
                        updateUserProps(deviceId, {
                            id: info.id,
                            client_name: info.client_name,
                            username: info.username,
                            user: info.user,
                            password: info.password,
                            host: info.host,
                            is_registered: true,
                            is_active: info.active,
                            expiration_date: info.expiration,
                            purchased_package: info.package
                        });
                        upsertNotifications(notifications);
                        result = { numId: 2, data: null };
                    } else { // Si la cuenta del usuario está inactiva...
                        updateUserProps(deviceId, {
                            client_name: info.client_name,
                            username: info.username,
                            is_registered: true,
                            is_active: info.active,
                        });
                        result = { numId: 3, data: null };
                    }
                }
            } catch (error) {
                ErrorLogger.log('Inicio - request', error);
                //console.error('Error en la petición:', error);
            } finally {
                isRequestDone = true;    // marca que la petición terminó
            }
        };

        // Ejecuta ambas operaciones: petición y espera de 1.5 segundos
        request();

        // Cuando la espera termina, si la petición ya finalizó, maneja el resultado
        delay.then(() => {
            if (isRequestDone) {
                manejarResultado(result);
            }
        });

        // Verifica constantemente si ambas operaciones ya terminaron
        const checkRequestInterval = setInterval(() => {
            if (isRequestDone && isDelayDone) {
                clearInterval(checkRequestInterval); // limpia el intervalo
                manejarResultado(result);            // ejecuta navegación o muestra error
            }
        }, 100); // se revisa cada 100ms

        // Función para decidir qué hacer con el resultado de la petición
        const manejarResultado = (resultado) => {
            switch (resultado.numId) {
                case 1:
                    navigation.replace('Activation', { reactivation: false }); // Ir a Activación
                    break;
                case 2:
                    navigation.replace('Menu', { updateNow: false }); // Ir a Menú
                    break;
                case 3:
                    navigation.replace('Activation', { reactivation: true }); // Ir a Activación para 'reactivar'
                    break;
                case 0:
                    ErrorLogger.log('Inicio - manejarResultado (errorId: 4)', 'Sin conexión a Internet.');
                    setErrorId(4); // Caso especifico sin internet
                    setModalVisible(true); // Muestra el modal para recargar la aplicación o salir
                    break;
                default:
                    ErrorLogger.log('Inicio - manejarResultado (errorId: 3)', 'Error al cargar la aplicación (genérico).');
                    setErrorId(3); // Error genérico
                    setModalVisible(true); // Muestra el modal para recargar la aplicación o salir
                    break;
            }
        };

        // Limpieza del intervalo si el componente se desmonta antes de completar
        return () => clearInterval(checkRequestInterval);
    }, []);

    useEffect(() => {
        const backAction = () => {
            // Muestra el modal de confirmación si se presiona el botón de Regresar y el modal está oculto
            setModalVisible(true);
            return true;
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

        return () => backHandler.remove();
    }, [modalVisible]);

    const handleReload = () => {
        RNRestart.restart();
    };

    const handleExit = () => {
        RNExitApp.exitApp(); // Cierra la aplicación
    };

    const handleCloseModal = () => {
        setModalVisible(false);
    };

    return (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            <ImageBackground
                source={require('../../assets/inicio.jpg')}
                style={{
                    flex: 1,
                    width: '100%',
                    height: '100%',
                }}
                resizeMode='cover'
            >
                <View style={{ flex: 1 }}>
                    <ModalConfirmation
                        visible={modalVisible}
                        onConfirm={handleReload}
                        onCancel={handleExit}
                        onRequestClose={handleCloseModal}
                        numdId={errorId}
                    />
                </View>
            </ImageBackground>
        </Animated.View>
    );
};

export default Inicio;
