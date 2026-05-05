import React, { useState, useCallback } from 'react';
import { View, Text, TouchableNativeFeedback, StyleSheet, Vibration, Platform } from "react-native";
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useXtream } from '../../services/hooks/useXtream';
import { useStreaming } from '../../services/hooks/useStreaming';
import ProgressBar from '../ProgressBar/progress_bar';
import { getDataMovie, getDataSerie } from '../../services/controllers/tmdbController';
import ErrorLogger from '../../services/logger/errorLogger';

const CardContenido = ({ navigation, tipo, item, favoritos, idCategory, episodio, onStartLoading, onFinishLoading, hideMessage, showModal, username, newHeight }) => {
    const { getEpisodes } = useXtream();
    const { updateProps } = useStreaming();
    const [error, setError] = useState(false);

    const imagen = tipo === 'series' ? item.cover : item.stream_icon;
    const item_id = tipo === 'series' ? 'series_id' : 'stream_id';

    const getTitle = (title) => {
        // Si el titulo contiene el patrón "S##E## - ", extrae todo lo demás, en caso contrario, asigna el titulo original
        const newTitle = title.match(/^[sS]\d+[eE]\d+\s*-\s*(.*)$/i) ? title.match(/^[sS]\d+[eE]\d+\s*-\s*(.*)$/i)[1].trim() : title;

        // Si el nuevo titulo contiene algún '(' o '-', devuelve todo antes del caracter, en caso contrario, devuelve el nuevo titulo completo
        return newTitle.match(/^([^(|-]+)/) ? newTitle.match((/^([^(|-]+)/))[1].trim() : newTitle;  
    };

    const handleNavigateToScreen = useCallback(async () => {
        hideMessage();
        const apiKey = await AsyncStorage.getItem('key_tmdb_api'); // Obtiene la key de la API de TMDB del almacenamiento asíncrono
        if (tipo === 'live') {
            navigation.navigate('Canal', { idContent: item.stream_id, idCategory, username });
        }
        else if (tipo === 'vod') {
            try {
                onStartLoading?.(); // Avisa a Seccion que inicie el modal de carga
                if (!item.tmdb_id) {
                    const poster = item.stream_icon.split('/').pop(); // Obtiene la última parte de la url del poster
                    const title = getTitle(item.title); // Obtiene solo la parte esencial del titulo en caso de que contenga algo adicional
                    const info = await getDataMovie(apiKey, title, item.year, `/${poster}`, item.release_date); // Obtiene la información general de la pelicula
                    if (info) {
                        updateProps(
                            tipo,
                            false,
                            item.stream_id,
                            {
                                tmdb_id: info.tmdb_id.toString(),
                                backdrop_path: info.backdrop_path,
                                original_title: info.original_title,
                                overview: info.overview,
                                poster_path: info.poster_path,
                                runtime: info.runtime.toString(),
                                genres: info.genres,
                                vote_average: info.vote_average.toString(),
                                release_date_aux: info.release_date,
                                cast: info.cast
                            }
                        );
                    }
                }
                navigation.navigate('Pelicula', { idContent: item.stream_id, username });
            } catch (error) {
                ErrorLogger.log(`CardContenido - handleNavigateToScreen (VOD_${item?.stream_id})`, error);
            } finally {
                onFinishLoading?.(); // Avisa a Seccion que termine el modal de carga
            }
        }
        else {
            try {
                onStartLoading?.(); // Avisa a Seccion que inicie el modal de carga
                if (!item.saga && !item.tmdb_id) {
                    const poster = (item.cover || "").split('/').pop(); // Obtiene la última parte de la url del poster
                    const backdrop = (item.backdrop_path || "").split('/').pop(); // Obtiene la última parte de la url de la imagen de fondo
                    const info = await getDataSerie(apiKey, item.title, item.year, item.release_date, `/${poster}`, `/${backdrop}`,); //Obtiene la información general de la pelicula
                    if (info) {
                        updateProps(
                            tipo,
                            false,
                            item.series_id,
                            {
                                tmdb_id: info.tmdb_id.toString(),
                                original_name: info.original_name,
                                backdrop_path_aux: info.backdrop_path,
                                poster_path: info.poster_path,
                                vote_average: info.vote_average.toString(),
                                genres: info.genres,
                                overview: info.overview,
                                first_air_date: info.first_air_date,
                                cast: info.cast
                            }
                        );
                    }
                }
                const response = await getEpisodes(item.series_id);
                console.log(response ? 'Episodios agregados' : 'No se agregaron los episodios');
                navigation.navigate('Serie', { idContent: item.series_id, username });
            } catch (error) {
                ErrorLogger.log(`CardContenido - handleNavigateToScreen (Series_${item?.series_id})`, error);
            } finally {
                onFinishLoading?.(); // Avisa a Seccion que termine el modal de carga
            }
        }
    }, [navigation, tipo, item, onStartLoading, onFinishLoading, getEpisodes]);

    const handleModalConfirmation = useCallback(async () => {
        Vibration.vibrate();
        showModal({
            id: item[item_id],
            nombre: item.name
        });
    }, [item, showModal]);

    const handleToggleFavorite = useCallback(async () => {
        Vibration.vibrate();
        const newFavoriteStatus = !item.favorito;

        updateProps(tipo, false, item[item_id], { favorito: newFavoriteStatus }); // Actualiza el item en el schema

        const currentTotal = favoritos.total;
        let newTotal = newFavoriteStatus ? currentTotal + 1 : Math.max(0, currentTotal - 1);

        updateProps(tipo, true, favoritos.category_id, { total: newTotal }); // Actualiza el total de la categoría Favoritos
    }, [tipo, item, favoritos]);

    const focusRipple = Platform.isTV ? TouchableNativeFeedback.Ripple('#FFD700', false) : TouchableNativeFeedback.Ripple('#00000080', false);

    return (
        <View style={[styles.container, { height: newHeight }]}>
            <TouchableNativeFeedback
                onPress={handleNavigateToScreen}
                onLongPress={idCategory === '0.2' ? handleModalConfirmation : handleToggleFavorite}
                background={focusRipple}
                useForeground={!Platform.isTV}
            >
                <View style={styles.borderSimulator}>
                    <View style={[styles.innerContent]}>
                        <FastImage
                            style={styles.image}
                            source={imagen && !error ? {
                                uri: imagen,
                                priority: FastImage.priority.normal
                            } : tipo === 'live' ? require('../../assets/icono.png') : require('../../assets/not_image.png')}
                            resizeMode={imagen && !error ? (tipo === 'live' ? FastImage.resizeMode.contain : FastImage.resizeMode.cover) : FastImage.resizeMode.contain}
                            onError={() => setError(true)}
                        />
                        {tipo !== 'live' && idCategory === '0.2' && (
                            <FastImage
                                style={styles.iconPlay}
                                source={require('../../assets/icono_play.png')}
                                resizeMode={FastImage.resizeMode.contain}
                            />
                        )}
                        <View style={[styles.topOverlay, { justifyContent: tipo !== 'live' && item.rating > 0 ? 'space-between' : 'flex-end', }]}>
                            {tipo !== 'live' && (tipo === 'vod' || idCategory !== '0.2') && item.rating > 0 && (
                                <Text style={styles.ratingText}>
                                    {item.rating}
                                </Text>
                            )}
                            {tipo === 'series' && idCategory === '0.2' && (
                                <Text style={styles.infoEpisode}>{`T${item.last_ep_played[0] + 1}:E${item.last_ep_played[1] + 1}`}</Text>
                            )}
                            {item.favorito && (
                                <Icon name={"heart"} size={20} color={"red"} />
                            )}
                        </View>
                        <View style={styles.bottomOverlay}>
                            <Text style={styles.titleText} numberOfLines={2}>{item.name}</Text>
                        </View>
                        {idCategory === '0.2' && ((tipo === 'vod' && item.playback_time > 0) || (tipo === 'series' && episodio)) && (
                            <ProgressBar
                                isVod={tipo === 'vod' ? true : false}
                                duration={tipo === 'vod'
                                    ? (item.episode_run_time !== "" ? Number(item.episode_run_time) : item.runtime !== "" ? Number(item.runtime) : 0)
                                    : (episodio.duration_secs !== "" ? Number(episodio.duration_secs) : 0)}
                                playback={tipo === 'vod' ? parseFloat(item.playback_time) : parseFloat(episodio.playback_time)}
                            />
                        )}
                    </View>
                </View>
            </TouchableNativeFeedback>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: '1%',
        width: '18%',
        overflow: Platform.isTV ? 'hidden' : 'visible',
        borderRadius: 8,
    },
    borderSimulator: {
        flex: 1,
        padding: Platform.isTV ? 5 : 0,
        borderRadius: 8,
    },
    innerContent: {
        borderColor: '#fff',
        borderWidth: 0.5,
        borderRadius: 5,
        backgroundColor: '#201F29',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 5,
    },
    iconPlay: {
        width: '35%',
        height: '35%',
        position: 'absolute',
        top: '30%',
        left: '30%',
        zIndex: 10,
    },
    topOverlay: {
        flexDirection: 'row',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingVertical: 2.5,
        paddingHorizontal: 2.5,
    },
    ratingText: {
        backgroundColor: 'rgb(28, 134, 199)',
        color: '#FFF',
        fontSize: 11,
        textAlign: 'center',
        borderRadius: 7.5,
        paddingVertical: 2.5,
        paddingHorizontal: 5,
    },
    infoEpisode: {
        backgroundColor: '#999',
        color: '#00008B',
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
        borderRadius: 7.5,
        paddingVertical: 2.5,
        paddingHorizontal: 5,
    },
    bottomOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        paddingVertical: 5,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
    },
    titleText: {
        color: '#FFF',
        textAlign: 'center',
    },
});

// Función para comparar si las props cambiaron realmente
const arePropsEqual = (prevProps, nextProps) => {
    // Verifica si es el mismo objeto de datos de Realm
    const isSameItem = prevProps.item === nextProps.item;
    // Verifica si el estado de favorito o visto cambió
    const isSameStatus = 
        prevProps.item.favorito === nextProps.item.favorito &&
        prevProps.item.visto === nextProps.item.visto;
    // Verifica si cambió la categoría donde estaba el usuario
    const isSameCategory = prevProps.idCategory === nextProps.idCategory;
    // Verifica si el contador de favoritos cambió
    const isSameTotal = prevProps.favoritos?.total === nextProps.favoritos?.total;

    // Si todo es igual, NO renderiza. Si algo cambió, SÍ renderiza
    return isSameItem && isSameStatus && isSameCategory && isSameTotal;    
};

export default React.memo(CardContenido, arePropsEqual);