import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Image, StyleSheet, TouchableOpacity, BackHandler, ImageBackground } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/FontAwesome';
import Icon3 from 'react-native-vector-icons/MaterialIcons';
import { setTV, setMovies, setSeries } from '../../services/redux/slices/contentSlice';
import { setCatsTV, setCatsMovies, setCatsSeries } from '../../services/redux/slices/categoriesSlice';
import { markAsViewed, setListNotifications } from '../../services/redux/slices/notificationsSlice';
import CardMultimedia from '../../components/Cards/card_multimedia';
import M3UController from '../../services/controllers/m3uController';
import ModalNotifications from '../../components/Modals/modal_notifications';
import ModalExit from '../../components/Modals/modal_exit';

const m3uController = new M3UController;

const Menu = ({ navigation }) => {
    const { catsTv, catsMovies, catsSeries } = useSelector(state => state.categories);
    const { tv, movies, series } = useSelector(state => state.content);
    const notificaciones = useSelector(state => state.notifications.list);
    const dispatch = useDispatch();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [modalNVisible, setModalNVisible] = useState(false); //Estado para manejar el modal de notifiaciones
    const [modalEVisible, setModalEVisible] = useState(false); //Estado para manejar el modal de salir
    const [allSeenNotifications, setAllSeenNotifications] = useState(false); //Estado para manejar si todas las notificaciones ya han sido vistas

    useEffect(() => {
        let isMounted = true; // Para evitar actualizar estado si el componente se desmonta

        if (notificaciones.length === 0) {
            const msg = [
                //{ id: 1, mensaje: "¡La fecha de expiración de su paquete es el lunes 14! Haga el pago para renovar antes de esa fecha y evite cortes en su servicio.\n\nAtte: Su Proveedor de Servicios", visto: false },
                //{ id: 2, mensaje: "¡La fecha de expiración de su paquete es el lunes 15! Haga el pago para renovar antes de esa fecha y evite cortes en su servicio.\n\nAtte: Su Proveedor de Servicios", visto: false },
                //{ id: 3, mensaje: "¡La fecha de expiración de su paquete es el lunes 16! Haga el pago para renovar antes de esa fecha y evite cortes en su servicio.\n\nAtte: Su Proveedor de Servicios", visto: false },
                //{ id: 4, mensaje: "¡La fecha de expiración de su paquete es el lunes 17! Haga el pago para renovar antes de esa fecha y evite cortes en su servicio.\n\nAtte: Su Proveedor de Servicios", visto: false },
            ];
            dispatch(setListNotifications(msg));
        }

        if (catsTv.length > 0 && tv.length > 0 && catsMovies.length > 0 && movies.length > 0 && catsSeries.length > 0 && series.length > 0) {
            console.log("Ya existe contenido");
        } else {
            console.log("Obteniendo contenido de la red");
            m3uController.handleGetDataByType(movies, catsMovies, series, catsSeries)
                .then(([categories, content]) => {
                    if (isMounted) {
                        dispatch(setCatsTV(categories[0]));
                        dispatch(setTV(content[0]));
                        dispatch(setCatsMovies(categories[1]));
                        dispatch(setMovies(content[1]));
                        dispatch(setCatsSeries(categories[2]));
                        dispatch(setSeries(content[2]));

                    }
                })
                .catch(error => console.log("Error al obtener datos:", error));
        }

        return () => { isMounted = false }; // Cleanup para evitar fugas de memoria
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
        if (notificaciones.length === 0 ) return; //Si no hay ninguna notificación, no hace nada

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

    const formattedDate = currentDate.toLocaleString('es-MX', optionsDate);

    const tiposMultimedia = [
        { tipo: 'TV', fondo: '#3D41E9' },
        { tipo: 'Cine', fondo: '#DD3652' },
        { tipo: 'Series', fondo: '#9743B5' }
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
                    <View style={{ alignItems: 'center', width: '66%', justifyContent: 'center' }}>
                        <Text style={styles.date}>{formattedDate}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '17%', justifyContent: 'flex-end' }}>
                        <TouchableOpacity onPress={() => setModalNVisible(true)} style={{ marginRight: 15 }}>
                            <Icon
                                name={notificaciones.length === 0 ? "bell-outline" : (allSeenNotifications ? "bell" : "bell-badge")}
                                color={notificaciones.length === 0 ? "white" : (allSeenNotifications ? "white" : "yellow")}
                                size={26}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('About')} style={{ marginRight: 15 }}>
                            <Icon2 name="info-circle" size={26} color="#FFF" />
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
                            tipo={multimedia.tipo}
                            fondo={multimedia.fondo}
                        />
                    ))}
                </View>

                {/* Footer con fecha de expiración y tipo de paquete */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>EXPIRACIÓN: octubre 4, 2024</Text>
                    <Text style={styles.footerText}>PAQUETE: 3 Meses</Text>
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
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    footerText: {
        color: '#fff',
        fontSize: 14,
        marginHorizontal: 5
    },
});

export default Menu;
