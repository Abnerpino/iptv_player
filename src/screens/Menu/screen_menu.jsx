import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Image, StyleSheet, TouchableOpacity, BackHandler, ImageBackground } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useXtream } from '../../services/hooks/useXtream';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon3 from 'react-native-vector-icons/MaterialIcons';
import Icon4 from 'react-native-vector-icons/Feather';
import { getItems } from '../../services/realm/streaming';
import { markAsViewed, setListNotifications } from '../../services/redux/slices/notificationsSlice';
import CardMultimedia from '../../components/Cards/card_multimedia';
import ModalNotifications from '../../components/Modals/modal_notifications';
import ModalExit from '../../components/Modals/modal_exit';
import ModalLoading from '../../components/Modals/modal_loading';

const Menu = ({ navigation }) => {
    //const { live, vod, series } = useSelector(state => state.streaming);
    const liveCardRef = useRef(null);
    const vodCardRef = useRef(null);
    const seriesCardRef = useRef(null);
    const { username, expirationDate, purchasedPackage } = useSelector(state => state.client);
    const notificaciones = useSelector(state => state.notifications.list);
    const dispatch = useDispatch();
    const { getFullStreaming } = useXtream();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [modalNVisible, setModalNVisible] = useState(false); //Estado para manejar el modal de notifiaciones
    const [modalEVisible, setModalEVisible] = useState(false); //Estado para manejar el modal de salir
    const [allSeenNotifications, setAllSeenNotifications] = useState(false); //Estado para manejar si todas las notificaciones ya han sido vistas
    const [loading, setLoading] = useState(false); //Estado para manejar el modal de carga

    const handleStartLoading = () => setLoading(true); //Cambia el valor a verdadero para que se muestre el modal de carga
    const handleFinishLoading = () => setLoading(false); //Cambia el valor a falso para que se cierre el modal de carga

    const updateLastUpdateTime = async () => {
        const now = new Date().getTime();

        try {
            await AsyncStorage.setItem('@last_update_time_iptv', now.toString());
            console.log('Tiempo actualizado');
        } catch (e) {
            console.error("Error al actualizar el tiempo de actualización", e);
        }
    };

    useEffect(() => {
        if (notificaciones.length === 0) {
            const msg = [
                //{ id: 1, mensaje: "¡La fecha de expiración de su paquete es el lunes 14! Haga el pago para renovar antes de esa fecha y evite cortes en su servicio.\n\nAtte: Su Proveedor de Servicios", visto: false },
                //{ id: 2, mensaje: "¡La fecha de expiración de su paquete es el lunes 15! Haga el pago para renovar antes de esa fecha y evite cortes en su servicio.\n\nAtte: Su Proveedor de Servicios", visto: false },
                //{ id: 3, mensaje: "¡La fecha de expiración de su paquete es el lunes 16! Haga el pago para renovar antes de esa fecha y evite cortes en su servicio.\n\nAtte: Su Proveedor de Servicios", visto: false },
                //{ id: 4, mensaje: "¡La fecha de expiración de su paquete es el lunes 17! Haga el pago para renovar antes de esa fecha y evite cortes en su servicio.\n\nAtte: Su Proveedor de Servicios", visto: false },
            ];
            dispatch(setListNotifications(msg));
        }

        const checkAndUpdateContent = async () => {
            try {
                const savedTime = await AsyncStorage.getItem('@last_update_time_iptv');
                const lastUpdate = savedTime ? parseInt(savedTime, 10) : null;
                const now = new Date().getTime();
                const secondsSinceUpdate = Math.floor((now - lastUpdate) / 1000);
                console.log(`Segundos desde la última actualización: ${secondsSinceUpdate.toFixed(2)}`);

                if (secondsSinceUpdate < 120) {
                    console.log("Aún no pasan 2 minutos, no se descarga nada.");
                    return;
                }

                handleStartLoading?.();
                await liveCardRef.current?.triggerUpdateEffects();
                await vodCardRef.current?.triggerUpdateEffects();
                await seriesCardRef.current?.triggerUpdateEffects();
                await updateLastUpdateTime();
                handleFinishLoading?.();
            } catch (error) {
                console.log('Ocurrió un error en el proceso de actualización: ', error);
                handleFinishLoading?.();
            }
        };

        checkAndUpdateContent();
    }, []); // Se ejecuta solo cuando se monta el componente

    useEffect(() => {
        // Función para actualizar la fecha y hora
        const updateDate = () => {
            setCurrentDate(new Date());
        };

        // Establece un intervalo para verificar cada segundo
        const intervalId = setInterval(() => {
            const now = new Date();
            // Solo actualiza si el segundo es 0 (es decir, al inicio de cada minuto)
            if (now.getSeconds() === 0) {
                updateDate();
            }
        }, 1000); // Verifica cada segundo

        // Limpia el intervalo al desmontar el componente
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (notificaciones.length === 0) return; //Si no hay ninguna notificación, no hace nada

        const result = notificaciones.find(item => item.visto === false); //Busca si hay notificaciones no vistas
        if (result) { //Si result no es indefinido, significa que todavia hay alguna notificación sin ver
            setAllSeenNotifications(false);
        } else { //Si result es indefinido, significa que todas las notificaciones han sido vistas
            setAllSeenNotifications(true);
        }
    }, [notificaciones]);

    /*Se ejecuta solo cuando la pantalla Menú está enfocada (es decir, solo cuando nos encontramos en Menú) y previene que,
    si se presiona el botón "Regresar" de Android en otra pantalla, no se active el modal para salir de la app*/
    useFocusEffect(
        useCallback(() => {
            const backAction = () => {
                setModalEVisible(true);
                return true;
            };

            const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

            return () => backHandler.remove();
        }, [])
    );

    const handleCloseModal = () => {
        setModalNVisible(false);
    };

    const handleConfirmExit = () => {
        BackHandler.exitApp(); // Cerrar la aplicación
    };

    const handleCancelExit = () => {
        setModalEVisible(false);
    };

    const optionsDate = {
        year: 'numeric',
        month: 'long', // '2-digit' para mes numérico
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true, // Para formato de 12 horas
        timeZone: 'America/Mexico_City', // Establece la zona horaria
    };

    const formattedDate = currentDate.toLocaleString('es-MX', optionsDate).split(',');

    const tiposMultimedia = [
        { referencia: liveCardRef, tipo: 'live', fondo: '#3D41E9' },
        { referencia: vodCardRef, tipo: 'vod', fondo: '#DD3652' },
        { referencia: seriesCardRef, tipo: 'series', fondo: '#9743B5' }
    ];

    return (
        <ImageBackground
            source={require('../../assets/fondo1.jpg')}
            style={{
                flex: 1,
                width: '100%',
                height: '100%',
            }}
            resizeMode='cover'
        >
            <View style={styles.container}>
                {/* Header con logo, fecha e iconos */}
                <View style={styles.header}>
                    <View style={{ width: '17%', justifyContent: 'center', marginLeft: -15, marginRight: 15 }}>
                        <Image
                            source={require('../../assets/imagotipo.png')}
                            style={{ height: '100%', width: '100%', resizeMode: 'contain', alignSelf: 'flex-start' }}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '66%', justifyContent: 'center', }}>
                        <Icon name="calendar" size={26} color="#FFF" />
                        <Text style={[styles.date, { marginLeft: 7.5, marginRight: 20 }]}>{formattedDate[0]}</Text>
                        <Icon2 name="clock" size={26} color="#FFF" />
                        <Text style={styles.date}>{formattedDate[1]}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '17%', justifyContent: 'flex-end' }}>
                        <TouchableOpacity onPress={() => setModalNVisible(true)} style={{ marginRight: 15 }}>
                            <Icon2
                                name={notificaciones.length === 0 ? "bell-outline" : (allSeenNotifications ? "bell" : "bell-badge")}
                                color={notificaciones.length === 0 ? "white" : (allSeenNotifications ? "white" : "yellow")}
                                size={26}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('About')} style={{ marginRight: 15 }}>
                            <Icon name="info-circle" size={26} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('SpeedTest')} style={{ marginRight: 15 }}>
                            <Icon3 name="network-check" size={26} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setModalEVisible(true)}>
                            <Icon3 name="exit-to-app" size={26} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Fila 1: TV en Directo, Cine, Series */}
                <View style={styles.row}>
                    {tiposMultimedia.map((multimedia, idx) => (
                        <CardMultimedia
                            key={idx}
                            navigation={navigation}
                            ref={multimedia.referencia}
                            tipo={multimedia.tipo}
                            fondo={multimedia.fondo}
                            onStartLoading={handleStartLoading}
                            onFinishLoading={handleFinishLoading}
                        />
                    ))}
                </View>

                {/* Footer con fecha de expiración, usuario y tipo de paquete */}
                <View style={styles.footer}>
                    <View style={{ flexDirection: 'row', width: '33%', paddingLeft: 5 }}>
                        <Icon2 name="calendar-clock" size={20} color="#FFF" />
                        <Text style={[styles.footerText, { fontWeight: 'bold' }]}>EXPIRACIÓN:</Text>
                        <Text style={styles.footerText}>{expirationDate}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', width: '34%', justifyContent: 'center' }}>
                        <Icon4 name="user" size={20} color="#FFF" />
                        <Text style={[styles.footerText, { fontWeight: 'bold' }]}>USUARIO:</Text>
                        <Text style={styles.footerText}>{username}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', width: '33%', justifyContent: 'flex-end', paddingRight: 5 }}>
                        <Icon2 name="package-variant-closed" size={20} color="#FFF" />
                        <Text style={[styles.footerText, { fontWeight: 'bold' }]}>PAQUETE:</Text>
                        <Text style={styles.footerText}>{purchasedPackage}</Text>
                    </View>
                </View>

                <ModalNotifications
                    openModal={modalNVisible}
                    handleCloseModal={handleCloseModal}
                />

                <ModalExit
                    visible={modalEVisible}
                    onConfirm={handleConfirmExit}
                    onCancel={handleCancelExit}
                />

                <ModalLoading visible={loading} />
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(16,16,16,0.5)',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        marginHorizontal: 5,
        height: '15%',
        width: '99%',
    },
    date: {
        color: '#fff',
        fontSize: 18,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        height: '70%'
    },
    footer: {
        marginTop: 'auto',
        flexDirection: 'row',
    },
    footerText: {
        color: '#fff',
        fontSize: 14,
        marginLeft: 5
    },
});

export default Menu;
