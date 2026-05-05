import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, Image, FlatList, StyleSheet, TouchableNativeFeedback, ImageBackground, Vibration, BackHandler, findNodeHandle, Platform } from 'react-native';
import TextTicker from 'react-native-text-ticker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useObject, useQuery } from '@realm/react';
import { showMessage, hideMessage } from 'react-native-flash-message';
import { useStreaming } from '../../services/hooks/useStreaming';
import { getCrashlytics, log } from '@react-native-firebase/crashlytics';
import RippleButton from '../../components/RippleButton/ripple_button';
import ProgressBar from '../../components/ProgressBar/progress_bar';
import StarRating from '../../components/StarRating';
import CardActor from '../../components/Cards/card_actor';
import Reproductor from '../../components/Reproductor';

const Pelicula = ({ navigation, route }) => {
    const { idContent, username } = route.params;
    const pelicula = useObject('Pelicula', idContent); // Encuentra la pelicula usando su Modelo y su ID

    const poster = pelicula.stream_icon ? pelicula.stream_icon : pelicula.poster_path ? `https://image.tmdb.org/t/p/original${pelicula.poster_path}` : null;
    const background = pelicula.backdrop_path;
    const originalTitle = pelicula.original_title ? pelicula.original_title : 'N/A';
    const release_date = pelicula.release_date ? pelicula.release_date : pelicula.release_date_aux;
    const genres = pelicula.genre ? pelicula.genre : pelicula.genres ? pelicula.genres : 'N/A';
    const runtime = pelicula.episode_run_time && pelicula.episode_run_time !== '0' ? Number(pelicula.episode_run_time) : pelicula.runtime ? Number(pelicula.runtime) : 0;
    const overview = pelicula.plot ? pelicula.plot : pelicula.overview ? pelicula.overview : 'Sinopsis no disponible';
    const rating = pelicula.rating && pelicula.rating !== '0' ? Number(pelicula.rating) : pelicula.vote_average ? Number(pelicula.vote_average) : 0;
    const cast = pelicula.cast ? JSON.parse(pelicula.cast) : [];

    const { getModelName, updateProps } = useStreaming();
    const categoryModel = getModelName('vod', true);
    const categories = useQuery(categoryModel);
    const vistos = categories.find(categoria => categoria.category_id === '0.2');
    const [favorite, setFavorite] = useState(pelicula?.favorito ?? false);
    const favoritos = categories.find(categoria => categoria.category_id === '0.3');
    const [error, setError] = useState(false);
    const [showReproductor, setShowReproductor] = useState(false);
    const [playbackTime, setPlaybackTime] = useState(parseFloat(pelicula.playback_time));
    const [focusTags, setFocusTags] = useState({ back: null, play: null, fav: null, card: null }); // Estado para manejar las etiquetas de los botones para la navegación
    const backBtnRef = useRef(null); // Referencia para el botón de Regresar
    const playBtnRef = useRef(null); // Referecia para el botón de Reproducir
    const favBtnRef = useRef(null); // Referencia para el botón de Favoritos
    const hasPerformedInitialSave = useRef(false);  // Referencia para saber cuando ya se guardó el 'playback_time' de la pelicula la primera vez que se reproduce

    const isComplete = (runtime > 0 && (playbackTime / (runtime * 60)) >= 0.99) ? true : false; //Bandera para saber cuando una pelicula ya se reprodujo por completo
    const focusRipple = Platform.isTV ? TouchableNativeFeedback.Ripple('#FFD700', false) : TouchableNativeFeedback.Ripple('#FFFFFF40', false);

    // Se ejecuta cada vez que la pantalla Pelicula está enfocada
    useFocusEffect(
        useCallback(() => {
            const crashlytics = getCrashlytics(); // Obtiene la instancia de Crashlytics
            log(crashlytics, `Pelicula (${idContent}${showReproductor ? ' - Playing' : ''})`); // Establece el mensaje
        }, [showReproductor]) // Se reejecuta cada vez que cambia la dependencia
    );

    // useEffect para vincular los botones para navegación explicita
    useEffect(() => {
        // Si no es TV, no hace nada
        if (!Platform.isTV) return;

        // Timeout para asegurar que los elementos estén montados
        const timer = setTimeout(() => {
            if (backBtnRef.current && playBtnRef.current && favBtnRef.current) {
                setFocusTags(prev => ({
                    ...prev,
                    back: findNodeHandle(backBtnRef.current),
                    play: findNodeHandle(playBtnRef.current),
                    fav: findNodeHandle(favBtnRef.current)
                })); // Encuentra los ids de los botones y los asigna
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    // Efecto para marcar como vista una pelicula
    useEffect(() => {
        const storedPlaybackTime = parseFloat(pelicula.playback_time); // Obtiene el tiempo de reproducción que tenía la pelicula al ser cargada

        // Verifica que la pelicula no haya sido guardado aún, que su 'playback_time' guardado sea 0 y que ya haya comenzado a reproducirse
        if (!hasPerformedInitialSave.current && storedPlaybackTime === 0 && playbackTime > 0) {
            updateProps('vod', false, pelicula.stream_id, { playback_time: playbackTime.toString() }); // Si se cumplen las condiciones, guarda el primer tiempo de reproducción que recibe
            hasPerformedInitialSave.current = true; // "Levanta la bandera" para no volver a ejecutar este guardado
        }

        // Verifica si ya se reprodujo al menos un fotograma de la pelicula
        if (playbackTime === 0) return;

        // Verifica si ya está en Vistos (para evitar agregar de nuevo)
        if (pelicula?.visto === true) return;

        updateProps('vod', false, pelicula.stream_id, { visto: true }); // Actualiza la pelicula en el schema

        const currentTotal = vistos.total;
        let newTotal = currentTotal + 1;

        updateProps('vod', true, vistos.category_id, { total: newTotal }); // Actualiza el total de la categoría Vistos
    }, [playbackTime]);

    useEffect(() => {
        const backAction = () => {
            handleBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

        return () => backHandler.remove();
    }, []);

    // Función para actualizar dinámicamente cualquier etiqueta de navagación de un elemento
    const updateFocusTags = (propiedad, valor) => {
        setFocusTags(prev => ({
            ...prev,
            [propiedad]: valor
        }));
    };

    const handleToggleFavorite = () => {
        const newFavoriteStatus = !favorite;

        setFavorite(newFavoriteStatus);

        updateProps('vod', false, pelicula.stream_id, { favorito: newFavoriteStatus }); // Actualiza la pelicula en el schema

        const currentTotal = favoritos.total;
        let newTotal = newFavoriteStatus ? currentTotal + 1 : Math.max(0, currentTotal - 1);

        updateProps('vod', true, favoritos.category_id, { total: newTotal }); // Actualiza el total de la categoría Favoritos
    };

    const handleBack = () => {
        hideMessage();
        navigation.goBack();
    };

    const convertDate = (date) => {
        const regex = /^\d{4}-\d{2}-\d{2}$/; // Formato AAAA-MM-DD

        // Verifica que la fecha no sea null ni cadena vacía y que tenga el formato correcto
        if (date && regex.test(date)) {
            const [y, m, d] = date.split('-').map(Number); // Separa la fecha por año, mes y día
            const fecha = new Date(y, m - 1, d);
            // Si el mes o el día cambiaron, la fecha original es inválida
            if (fecha.getFullYear() === y && (fecha.getMonth() + 1) === m && fecha.getDate() === d) {
                const day = d.toString().padStart(2, '0');
                const month = m.toString().padStart(2, '0');
                return `${day}/${month}/${y}`; // Nuevo formato AA/MM/AAAA
            }
        }

        // Plan B en caso de que la fecha no sea válida
        return pelicula.year ? pelicula.year : 'N/A';
    };

    const convertDuration = (minutes) => {
        if (minutes > 0) {
            let duration = '';
            const hours = Math.floor(minutes / 60); // Obtiene las horas
            const minutesRemaining = minutes % 60; // Obtiene los minutos restantes

            if (hours > 0) duration = `${hours}h `; // Formatea las horas
            if (minutesRemaining > 0) duration += `${minutesRemaining}m` // Formatea los minutos

            return duration.trim(); // Devuelva la duración completa, formateada y sin espacios al final
        } else return '0m';
    };

    const handleProgressUpdate = (time) => {
        setPlaybackTime(time);
    };

    const showToast = (mensaje) => {
        Vibration.vibrate();

        showMessage({
            message: mensaje,
            type: 'default',
            duration: 1000,
            backgroundColor: '#EEE',
            color: '#000',
            style: styles.flashMessage
        });
    };

    const ItemSeparator = () => (
        <View style={{ width: 10 }} /> // Espacio entre elementos
    );

    return (
        <>
            {!showReproductor ? (
                <ImageBackground
                    source={background ? { uri: `https://image.tmdb.org/t/p/original${background}` } : require('../../assets/fondo.jpg')} //Imagen de fondo
                    style={styles.imageBackground}
                >
                    <View style={[styles.container, { backgroundColor: background ? 'rgba(16,16,16,0.9)' : 'rgba(16,16,16,0.5)' }]}>
                        {/* Vista principal en columna */}
                        <View style={styles.containerBackButton}>
                            {/* Fila con el botón de Regresar, el logo de la App y el titulo de la Serie */}
                            <RippleButton
                                ref={backBtnRef}
                                mainStyle={styles.backButton}
                                iconLib={Icon}
                                name="arrow-circle-left"
                                onPress={handleBack}
                                onLongPress={() => showToast('Regresar')}
                                nextFocusRight={focusTags.back}
                            />
                            <Image
                                source={require('../../assets/imagotipo.png')}
                                style={styles.logo}
                            />
                            <View style={styles.containerTitle}>
                                <TextTicker
                                    style={styles.title}
                                    duration={25000}
                                    loop
                                    bounce={false}
                                    repeatSpacer={200}
                                    marqueeDelay={250}
                                >
                                    {pelicula.name}
                                </TextTicker>
                            </View>
                        </View>

                        {/* ScrollView para contenido desplazable */}
                        <ScrollView>
                            {/* Vista en fila dentro del ScrollView */}
                            <View style={styles.containerDetailsMovie}>
                                <Image
                                    source={poster && !error ? { uri: poster } : require('../../assets/not_image.png')} // URL de la imagen
                                    style={styles.poster}
                                    onError={() => setError(true)}
                                    resizeMode='stretch'
                                />
                                <View style={styles.details}>
                                    <View style={styles.column}>
                                        <Text style={[styles.text, { fontWeight: 'bold' }]}>Título original:</Text>
                                        <Text style={[styles.text, { fontWeight: 'bold' }]}>Lanzamiento:</Text>
                                        <Text style={[styles.text, { fontWeight: 'bold' }]}>Duración:</Text>
                                        <Text style={[styles.text, { fontWeight: 'bold' }]}>Género:</Text>
                                        <Text style={[styles.text, { fontWeight: 'bold' }]}>Calificación:</Text>
                                    </View>
                                    <View style={[styles.column, { marginLeft: '18.5%', }]}>
                                        <Text style={styles.text}>{originalTitle}</Text>
                                        <Text style={styles.text}>{convertDate(release_date)}</Text>
                                        <Text style={[styles.text, styles.runtime]}>{convertDuration(runtime)}</Text>
                                        <Text style={styles.text}>{genres}</Text>
                                        <StarRating rating={rating} size={20} />
                                    </View>
                                </View>
                            </View>
                            <View style={styles.containerButtons}>
                                <View style={styles.buttonWrapper}>
                                    <TouchableNativeFeedback
                                        ref={playBtnRef}
                                        onPress={() => setShowReproductor(true)}
                                        background={focusRipple}
                                        useForeground={!Platform.isTV}
                                        hasTVPreferredFocus={Platform.isTV}
                                        nextFocusLeft={focusTags.play}
                                        nextFocusDown={focusTags.card}
                                    >
                                        <View style={styles.borderSimulator}>
                                            <View style={styles.innerContentButton}>
                                                <View style={styles.buttonContent}>
                                                    <Icon name="play-circle-o" size={Platform.isTV ? 24 : 22} color="white" />
                                                    <Text style={styles.textButton}>
                                                        {playbackTime === 0 ? 'Reproducir' : isComplete ? 'Reiniciar' : 'Reanudar'}
                                                    </Text>
                                                </View>
                                                {playbackTime > 0 && (
                                                    <View style={styles.progressBarContainer}>
                                                        <ProgressBar isVod={true} duration={runtime} playback={playbackTime} />
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                                <View style={styles.buttonWrapper}>
                                    <TouchableNativeFeedback
                                        ref={favBtnRef}
                                        onPress={handleToggleFavorite}
                                        background={focusRipple}
                                        useForeground={!Platform.isTV}
                                        nextFocusRight={focusTags.fav}
                                        nextFocusDown={focusTags.card}
                                    >
                                        <View style={styles.borderSimulator}>
                                            <View style={[styles.innerContentButton, { backgroundColor: 'rgb(80,80,100)' }]}>
                                                <View style={styles.buttonContent}>
                                                    <Icon name={!favorite ? "heart-o" : "heart"} size={Platform.isTV ? 24 : 22} color={!favorite ? "black" : "red"} />
                                                    <Text style={styles.textButton}>
                                                        {!favorite ? 'Agregar a Favoritos' : 'Quitar de Favoritos'}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                            </View>
                            <View style={{ paddingVertical: 10, }}>
                                <Text style={styles.overview}>{overview}</Text>
                            </View>
                            {/* Vista en columna con texto y FlatList */}
                            {Array.isArray(cast) && cast.length > 0 ? (
                                <View style={styles.containerFlatList}>
                                    <FlatList
                                        data={cast}
                                        horizontal
                                        renderItem={({ item, index }) => (
                                            <CardActor
                                                index={index}
                                                imagen={item.imagen}
                                                nombre={item.nombre}
                                                upTag={focusTags.play}
                                                getFirstCard={updateFocusTags}
                                            />
                                        )}
                                        keyExtractor={(item, index) => index.toString()}
                                        ItemSeparatorComponent={ItemSeparator}
                                    />
                                </View>
                            ) : null}
                        </ScrollView>
                    </View>
                </ImageBackground>
            ) : (
                <Reproductor
                    tipo={'vod'}
                    fullScreen={true}
                    contenido={pelicula}
                    setMostrar={(value) => setShowReproductor(value)}
                    onProgressUpdate={handleProgressUpdate}
                    username={username}
                />
            )}
        </>
    );
};

// Estilos para la aplicación
const styles = StyleSheet.create({
    imageBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 25,
    },
    containerBackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    backButton: {
        marginHorizontal: -20,
        paddingHorizontal: 20,
        paddingVertical: 10
    },
    logo: {
        height: '100%',
        width: '14%',
        resizeMode: 'contain'
    },
    containerTitle: {
        width: '83.5%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: Platform.isTV ? 22 : 20,
        color: '#fff',
        fontWeight: 'bold',
    },
    containerDetailsMovie: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    poster: {
        flex: 0.175,
        borderRadius: 5,
        borderColor: '#fff',
        borderWidth: 0.5,
        backgroundColor: '#201F29'
    },
    details: {
        flexDirection: 'row',
        paddingLeft: '7.5%',
        paddingVertical: 10,
        flex: 0.825,
    },
    column: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    text: {
        fontSize: Platform.isTV ? 18 : 16,
        color: '#CCC',
        marginVertical: 8,
    },
    runtime: {
        backgroundColor: 'rgba(80,80,100,0.5)',
        paddingHorizontal: 10,
        paddingBottom: 2,
        borderRadius: 5
    },
    containerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingTop: 10,
    },
    buttonWrapper: {
        width: '25%',
        borderRadius: 5,
        overflow: 'hidden'
    },
    borderSimulator: {
        flex: 1,
        padding: Platform.isTV ? 3 : 0,
    },
    innerContentButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3,
        backgroundColor: 'rgb(80,80,100)',
    },
    buttonContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 5,
        alignItems: 'center',
        width: '100%',
    },
    progressBarContainer: {
        width: '100%',
        position: 'absolute',
        bottom: 0,
    },
    textButton: {
        fontSize: Platform.isTV ? 18 : 16,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
        paddingLeft: 5
    },
    overview: {
        fontSize: Platform.isTV ? 18 : 16,
        textAlign: 'justify',
        color: '#CCC',
    },
    containerFlatList: {
        padding: 5,
    },
    flashMessage: {
        width: '12.5%',
        borderRadius: 20,
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingTop: 1,
        paddingBottom: 5,
        marginTop: '5.5%',
        marginLeft: 1
    },
});

export default Pelicula;