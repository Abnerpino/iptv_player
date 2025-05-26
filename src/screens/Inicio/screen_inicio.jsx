import React, { useEffect, useRef } from 'react';
import { Animated, ImageBackground } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import RNRestart from 'react-native-restart';
import { useDispatch, useSelector } from 'react-redux';
import HostingController from '../../services/controllers/hostingController';
import { useXtream } from '../../services/hooks/useXtream';
import { setAndroid, setDeviceID, setDeviceModel, setExpirationDate, setHost, setIsActive, setPassword, setPurchasedPackage, setUser, setUsername } from '../../services/redux/slices/clientSlice';
import { setListNotifications } from '../../services/redux/slices/notificationsSlice';

const hostingController = new HostingController();

const Inicio = ({ navigation }) => {
    const { getInfoAccount } = useXtream();
    const dispatch = useDispatch();
    const { id, deviceId, isActive } = useSelector(state => state.client);
    
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
        let result = null;             // almacena el resultado de la petición

        // Simula el retraso mínimo de 1.5 segundos antes de permitir navegación
        const delay = new Promise(resolve => setTimeout(() => {
            isDelayDone = true;         // marca que el tiempo ya pasó
            resolve();
        }, 1500));

        // Ejecuta la petición asincrónica
        const request = async () => {
            try {
                //dispatch(setDeviceID(''));
                console.log('deviceId: ', deviceId);
                if (!deviceId) {
                    let devId = await DeviceInfo.getUniqueId();
                    dispatch(setDeviceID(devId));
                    dispatch(setDeviceModel(DeviceInfo.getModel()));
                    dispatch(setAndroid(DeviceInfo.getSystemVersion()));
                    const response = await hostingController.verificarCliente(devId);
                    result = response; // guarda el resultado de la petición
                } else {
                    //await getInfoAccount();
                    const response = await hostingController.verificarCliente(deviceId);
                    const status = response?.active ?? false;
                    if (status) {
                        const notifications = await hostingController.obtenerNotificaciones(id);
                        dispatch(setUsername(response.user_name));
                        dispatch(setUser(response.user));
                        dispatch(setPassword(response.password));
                        dispatch(setHost(response.host));
                        dispatch(setExpirationDate(response.expiration));
                        dispatch(setPurchasedPackage(response.package));
                        dispatch(setListNotifications(notifications ? notifications : []));
                        result = {};
                        //Agregar alguna condición para que haga la petición automatica cada 48h
                    } else {
                        dispatch(setIsActive(response.active));
                        result = response;
                    }
                }
            } catch (error) {
                console.error('Error en la petición:', error);
                //Agregar aqui que se muestre un modal para recargar aplicación
                //RNRestart.restart();
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
        const manejarResultado = (data) => {
            if (data === null) {
                console.error('Resultado de la petición es null');
                //Agregar aqui que se muestre un modal para recargar aplicación
                //RNRestart.restart();
                return;
            }

            if (Array.isArray(data)) {
                navigation.replace('Activation', { data }); // si es un arreglo, ir a Activation
            } else if (typeof data === 'object' && Object.keys(data).length > 0) {
                console.log('Necesita reactivación');
                //Agregar pantalla para reactivación
            }
             else if (typeof data === 'object' && Object.keys(data).length === 0) {
                navigation.replace('Menu');       // si es un objeto y está vacío, ir a Menu
            } else {
                console.error('Tipo de respuesta desconocido');
            }
        };

        // Limpieza del intervalo si el componente se desmonta antes de completar
        return () => clearInterval(checkRequestInterval);
    }, []);

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
            />
        </Animated.View>
    );
};

export default Inicio;
