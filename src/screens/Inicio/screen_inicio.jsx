import React, { useEffect, useRef, useState } from 'react';
import { Animated, ImageBackground, View, BackHandler } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import RNRestart from 'react-native-restart';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@realm/react';
import HostingController from '../../services/controllers/hostingController';
import { useXtream } from '../../services/hooks/useXtream';
import { useStreaming } from '../../services/hooks/useStreaming';
import ModalConfirmation from '../../components/Modals/modal_confirmation';

const hostingController = new HostingController();

const Inicio = ({ navigation }) => {
    const { getInfoAccount } = useXtream();
    const { createUser, upsertNotifications, updateUserProps } = useStreaming();
    const usuario = useQuery('Usuario');
    const [modalVisible, setModalVisible] = useState(false); //Estado para manejar el modal de confirmación

    // Valor de animación de opacidad, comienza en 0 (transparente)
    const fadeAnim = useRef(new Animated.Value(0)).current;

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
                console.error("Error al guardar el tiempo de actualización", e);
            }
        };

        saveLastUpdateTime();

        // Ejecuta la petición asincrónica
        const request = async () => {
            try {
                const deviceId = await DeviceInfo.getUniqueId();
                console.log('deviceId: ', deviceId);
                const response = await hostingController.verificarCliente(deviceId);
                result = response; // guarda el resultado de la petición

                // Si todavía no existe localmente el usuario, lo crea
                if (!usuario[0]) {
                    const newUser = {
                        id: '',
                        device_id: deviceId,
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

                // Si el usuario ya existe en la nube...
                if (response.numId === 2) {
                    //await getInfoAccount();
                    const info = response.data;
                    // Si la cuenta del usuario está activa...
                    if (info.active) {
                        const notifications = await hostingController.obtenerNotificaciones(info.id);
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
                        result = { numId: response.numId, data: null };
                        //Agregar alguna condición para que haga la petición automatica cada 48h
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
                console.error('Error en la petición:', error);
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
                    navigation.replace('Activation', { data: resultado.data }); // Ir a Activación
                    break;
                case 2:
                    navigation.replace('Menu'); // Ir a Menú
                    break;
                case 3:
                    navigation.replace('Activation', { reactivation: true }); // Ir a Activación para 'reactivar'
                    break;
                default:
                    setModalVisible(true); // Muestre el modal para recargar la aplicación
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
        BackHandler.exitApp(); // Cierra la aplicación
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
                <View>
                    <ModalConfirmation
                        visible={modalVisible}
                        onConfirm={handleReload}
                        onCancel={handleExit}
                        onRequestClose={handleCloseModal}
                        numdId={3}
                    />
                </View>
            </ImageBackground>
        </Animated.View>
    );
};

export default Inicio;
