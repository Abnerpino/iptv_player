import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Image, StyleSheet, TouchableOpacity, BackHandler, ImageBackground, Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@realm/react';
import { showMessage, hideMessage } from 'react-native-flash-message';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon3 from 'react-native-vector-icons/MaterialIcons';
import Icon4 from 'react-native-vector-icons/Feather';
import Icon5 from 'react-native-vector-icons/Ionicons';
import CardMultimedia from '../../components/Cards/card_multimedia';
import ModalNotifications from '../../components/Modals/modal_notifications';
import ModalConfirmation from '../../components/Modals/modal_confirmation';
import ModalError from '../../components/Modals/modal_error';
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
    const [modalEVisible, setModalEVisible] = useState(false); //Estado para manejar el modal de error
    const [errores, setErrores] = useState([]); //Estado para almacenar los errores de actualización de cada Card
    const [tiempo, setTiempo] = useState(); //Estado para almacenar el tiempo que falta la actualización automática
    const [allSeenNotifications, setAllSeenNotifications] = useState(false); //Estado para manejar si todas las notificaciones ya han sido vistas
    const [loading, setLoading] = useState(false); //Estado para manejar el modal de carga

    const notificaciones = React.useMemo(() => {
        return notifications.sorted('fecha', true);
    }, [notifications]);

    const handleStartLoading = () => setLoading(true); //Cambia el valor a verdadero para que se muestre el modal de carga
    const handleFinishLoading = () => setLoading(false); //Cambia el valor a falso para que se cierre el modal de carga

    const getSecondsSinceUpdate = async () => {
        const now = new Date().getTime(); // Obtiene el tiempo actual en milisegundos

        try {
            const savedTime = await AsyncStorage.getItem('@last_update_time_iptv'); // Obtiene el tiempo guardado en el almacenamiento asíncrono
            const lastUpdate = savedTime ? parseInt(savedTime, 10) : 0; // Convierte 'savedTime' (string) en un número entero en base 10 (decimal)
            const seconds = Math.floor((now - lastUpdate) / 1000); // Calcula la diferencia entre ambos tiempos (milisegundos), convierte el resultado a segundos y lo redondea hacia abajo
            console.log(`Segundos desde la última actualización: ${seconds.toFixed(2)}`);
            return seconds; // Retorna los segundos que han pasado desde la última actualización del contenido
        } catch (e) {
            console.error("Error al obtener los segundos desde la última actualización", e);
            return 0;
        }
    };

    const updateLastUpdateTime = async () => {
        const now = new Date().getTime(); // Obtiene el tiempo actual en milisegundos

        try {
            await AsyncStorage.setItem('@last_update_time_iptv', now.toString()); // Guarda el tiempo como string en el almacenamiento asíncrono
            console.log('Tiempo actualizado');
        } catch (e) {
            console.error("Error al actualizar el tiempo de actualización", e);
        }
    };

    useEffect(() => {
        const checkAndUpdateContent = async () => {
            const localError = []; // Arreglo local para almacenar los tipos de multimedia que fallaron en la actualización

            try {
                const secondsSinceUpdate = await getSecondsSinceUpdate(); // Obtiene los segundos que han pasado desde la última actualización del contenido

                // Si ya pasaron 24 horas...
                if (secondsSinceUpdate > 86400) {
                    handleStartLoading?.(); // Activa el modal de carga

                    // Para cada tipo de Multimedia...
                    for (const multimedia of tiposMultimedia) {
                        try {
                            await multimedia.referencia.current?.triggerUpdateEffects(); // Actualiza su contenido
                        } catch (e) {
                            console.log(`Error al actualizar ${multimedia.tipo}:`, e);
                            localError.push(multimedia.tipo); // Agrega el tipo de multimedia que falló
                        }
                    }

                    await updateLastUpdateTime(); // Actualiza el tiempo de la última actualización
                }
            } catch (error) {
                console.log('Ocurrió un error en el proceso de actualización: ', error);
            } finally {
                handleFinishLoading?.(); // Termina el modal de carga
                // Si hubo por lo menos un error...
                if (localError.length > 0) {
                    setErrores(localError); // Actualiza los errores en el estado 
                    setModalEVisible(true); // Muestra el modal de errores
                }
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
        const getSecondsToUpdate = async () => {
            const secondsSinceUpdate = await getSecondsSinceUpdate(); // Obtiene los segundos que han pasado desde la última actualización del contenido
            const secondsToUpdate = 86400 - secondsSinceUpdate; // Calcula la diferencia entre 84600 segundos (24 horas) y los segundos desde la última actualización
            setTiempo(secondsToUpdate); // Actualiza el tiempo en el estado
        };

        getSecondsToUpdate();
    }, [errores]);

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

    const handleManualError = (tipoError) => {
        setErrores([tipoError]); // Crea un array con el único error
        setModalEVisible(true);  // Muestra el modal
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
                            <Icon5 name="exit-outline" size={26} color="white" />
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
                            onUpdateError={handleManualError}
                            username={usuario[0]?.username}
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

                <ModalError
                    visible={modalEVisible}
                    error={errores}
                    tiempo={tiempo}
                    onClose={() => setModalEVisible(false)}
                />

                {!modalEVisible && (
                    <ModalNotifications
                        notificaciones={notificaciones}
                        openModal={modalNVisible}
                        handleCloseModal={() => setModalNVisible(false)}
                        expiracion={usuario[0]?.expiration_date}
                    />
                )}

                <ModalConfirmation
                    visible={modalCVisible}
                    onConfirm={() => BackHandler.exitApp()}
                    onCancel={() => setModalCVisible(false)}
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
