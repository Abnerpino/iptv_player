import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Image, StyleSheet, TouchableOpacity, BackHandler, ImageBackground, Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@realm/react';
import { showMessage, hideMessage } from 'react-native-flash-message';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon3 from 'react-native-vector-icons/MaterialIcons';
import Icon4 from 'react-native-vector-icons/Feather';
import CardMultimedia from '../../components/Cards/card_multimedia';
import ModalNotifications from '../../components/Modals/modal_notifications';
import ModalConfirmation from '../../components/Modals/modal_confirmation';
import ModalLoading from '../../components/Modals/modal_loading';

const Menu = ({ navigation }) => {
    const liveCardRef = useRef(null);
    const vodCardRef = useRef(null);
    const seriesCardRef = useRef(null);
    const usuario = useQuery('Usuario');
    const notifications = useQuery('Notificacion');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [modalNVisible, setModalNVisible] = useState(false); //Estado para manejar el modal de notifiaciones
    const [modalCVisible, setModalCVisible] = useState(false); //Estado para manejar el modal de confirmación
    const [allSeenNotifications, setAllSeenNotifications] = useState(false); //Estado para manejar si todas las notificaciones ya han sido vistas
    const [loading, setLoading] = useState(false); //Estado para manejar el modal de carga

    const notificaciones = React.useMemo(() => {
        return notifications.sorted('fecha', true);
    }, [notifications]);

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
        const checkAndUpdateContent = async () => {
            try {
                const savedTime = await AsyncStorage.getItem('@last_update_time_iptv');
                const lastUpdate = savedTime ? parseInt(savedTime, 10) : null;
                const now = new Date().getTime();
                const secondsSinceUpdate = Math.floor((now - lastUpdate) / 1000);
                console.log(`Segundos desde la última actualización: ${secondsSinceUpdate.toFixed(2)}`);

                if (secondsSinceUpdate < 120) {
                    console.log("Aún no pasan 2 minutos, no se descarga nada.");
                    //return;
                } else {
                    handleStartLoading?.();
                    await liveCardRef.current?.triggerUpdateEffects();
                    await vodCardRef.current?.triggerUpdateEffects();
                    await seriesCardRef.current?.triggerUpdateEffects();
                    await updateLastUpdateTime();
                    handleFinishLoading?.();
                }
            } catch (error) {
                console.log('Ocurrió un error en el proceso de actualización: ', error);
                handleFinishLoading?.();
            }

            // Si hay notificaciones...
            if (notificaciones.length > 0) {
                const result = notificaciones.find(item => item.visto === false); //Busca si hay notificaciones no vistas
                //Si todavia hay alguna notificación sin ver...
                if (result) {
                    setModalNVisible(true); // Muestra el modal cada vez que se monte la pantalla Menú
                }
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
                setModalCVisible(true);
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
        setModalCVisible(false);
    };

    const showToast = (mensaje) => {
        Vibration.vibrate();

        showMessage({
            message: mensaje,
            type: 'default',
            duration: 1000,
            backgroundColor: '#EEE',
            color: '#000',
            style: styles.flashMessage,
        });
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
                        <TouchableOpacity
                            style={{ marginRight: 15 }}
                            onPress={() => {
                                hideMessage();
                                setModalNVisible(true);
                            }}
                            onLongPress={() => showToast('Notificaciones')}
                        >
                            <Icon2
                                name={notificaciones.length === 0 ? "bell-outline" : (allSeenNotifications ? "bell" : "bell-badge")}
                                color={notificaciones.length === 0 ? "white" : (allSeenNotifications ? "white" : "yellow")}
                                size={26}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ marginRight: 15 }}
                            onPress={() => {
                                hideMessage();
                                navigation.navigate('About');
                            }}
                            onLongPress={() => showToast('Sobre la App')}
                        >
                            <Icon name="info-circle" size={26} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ marginRight: 15 }}
                            onPress={() => {
                                hideMessage();
                                navigation.navigate('SpeedTest')
                            }}
                            onLongPress={() => showToast('Test de Internet')}
                        >
                            <Icon3 name="network-check" size={26} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                hideMessage();
                                setModalCVisible(true);
                            }}
                            onLongPress={() => showToast('Salir de la App')}
                        >
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
                        <Text style={styles.footerText}>{usuario[0]?.expiration_date}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', width: '34%', justifyContent: 'center' }}>
                        <Icon4 name="user" size={20} color="#FFF" />
                        <Text style={[styles.footerText, { fontWeight: 'bold' }]}>USUARIO:</Text>
                        <Text style={styles.footerText}>{usuario[0]?.username}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', width: '33%', justifyContent: 'flex-end', paddingRight: 5 }}>
                        <Icon2 name="package-variant-closed" size={20} color="#FFF" />
                        <Text style={[styles.footerText, { fontWeight: 'bold' }]}>PAQUETE:</Text>
                        <Text style={styles.footerText}>{usuario[0]?.purchased_package}</Text>
                    </View>
                </View>

                <ModalNotifications
                    notificaciones={notificaciones}
                    openModal={modalNVisible}
                    handleCloseModal={handleCloseModal}
                    expiracion={usuario[0]?.expiration_date}
                />

                <ModalConfirmation
                    visible={modalCVisible}
                    onConfirm={handleConfirmExit}
                    onCancel={handleCancelExit}
                    numdId={1}
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
    flashMessage: {
        width: '17%',
        borderRadius: 20,
        alignItems: 'center',
        alignSelf: 'flex-end',
        paddingTop: 1,
        paddingBottom: 5,
        marginTop: '8.5%',
        marginRight: 22.5
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
