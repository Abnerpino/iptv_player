import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration } from "react-native";
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useXtream } from '../../services/hooks/useXtream';
import { useStreaming } from '../../services/hooks/useStreaming';
import { useQuery } from '@realm/react';
import ProgressBar from '../ProgressBar/progress_bar';
import TMDBController from "../../services/controllers/tmdbController";

const tmdbController = new TMDBController;

const CardContenido = ({ navigation, tipo, item, idCategory, onStartLoading, onFinishLoading }) => {
    const { getEpisodes } = useXtream();
    const { getModelName, getLastPlayedEpisode, updateProps } = useStreaming();
    const [error, setError] = useState(false);

    // Obtiene las categorías correctas según el tipo
    const categoryModel = getModelName(tipo, true);
    const categories = useQuery(categoryModel);
    const favoritos = categories.find(categoria => categoria.category_id === '0.3');

    const imagen = tipo === 'series' ? item.cover : item.stream_icon;
    const item_id = tipo === 'series' ? 'series_id' : 'stream_id';
    const episodio = (tipo === 'series' && item.visto) ? getLastPlayedEpisode(item.series_id, item.last_ep_played[0], item.last_ep_played[1]) : null;

    const handleNavigateToScreen = useCallback(async () => {
        if (tipo === 'live') {
            navigation.navigate('Canal', { selectedContent: item, idCategory });
        }
        else if (tipo === 'vod') {
            try {
                onStartLoading?.(); // Avisa a Seccion que inicie el modal de carga
                if (!item.tmdb_id) {
                    const info = await tmdbController.getDataMovie(item.title, item.year, item.release_date); //Obtiene la información general de la pelicula
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
                                cast: info.cast
                            }
                        );
                    }
                }
                navigation.navigate('Pelicula', { selectedContent: item });
            } catch (error) {
                //Mostrar mensaje de que no está disponible el contenido
                console.log(error);
            } finally {
                onFinishLoading?.(); // Avisa a Seccion que termine el modal de carga
            }
        }
        else {
            try {
                onStartLoading?.(); // Avisa a Seccion que inicie el modal de carga
                if (!item.saga && !item.tmdb_id) {
                    const info = await tmdbController.getDataSerie(item.title, item.year, item.release_date); //Obtiene la información general de la pelicula
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
                                cast: info.cast
                            }
                        );
                    }
                }
                const response = await getEpisodes(item.series_id);
                response ? console.log('Episodios agregados') : console.log('No se agregaron los episodios');
                navigation.navigate('Serie', { tipo, selectedContent: item });
            } catch (error) {
                //Mostrar mensaje de que no está disponible el contenido
                console.log('CardContenido: ', error);
            } finally {
                onFinishLoading?.(); // Avisa a Seccion que termine el modal de carga
            }
        }
    }, [navigation, tipo, item, onStartLoading, onFinishLoading, getEpisodes]);

    const handleToggleFavorite = useCallback(async () => {
        Vibration.vibrate();
        const newFavoriteStatus = !item.favorito;

        updateProps(tipo, false, item[item_id], { favorito: newFavoriteStatus }); // Actualiza el item en el schema

        const currentTotal = favoritos.total;
        let newTotal = newFavoriteStatus ? currentTotal + 1 : Math.max(0, currentTotal - 1);

        updateProps(tipo, true, favoritos.category_id, { total: newTotal }); // Actualiza el total de la categoría Favoritos
    }, [tipo, item]);

    return (
        <TouchableOpacity
            style={[styles.container, { height: tipo === 'live' ? 100 : 160 }]}
            onPress={handleNavigateToScreen}
            onLongPress={handleToggleFavorite}
        >
            <FastImage
                style={styles.image}
                source={imagen && !error ? { uri: imagen } : require('../../assets/not_image.png')}
                onError={() => setError(true)}
                resizeMode={imagen && !error ? "cover" : "contain"}
            />
            <View style={[styles.topOverlay, { justifyContent: tipo !== 'live' && item.rating > 0 ? 'space-between' : 'flex-end', }]}>
                {tipo !== 'live' && item.rating > 0 && (
                    <Text style={styles.ratingText}>
                        {item.rating}
                    </Text>
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
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: '1%',
        width: '18%',
        borderColor: '#fff',
        borderWidth: 0.5,
        borderRadius: 5,
        backgroundColor: '#201F29',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 5,
    },
    topOverlay: {
        flexDirection: 'row',
        position: 'absolute',
        top: 0, // Posiciona el texto en la parte superior
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
    bottomOverlay: {
        position: 'absolute',
        bottom: 0,  // Posiciona el texto en la parte inferior
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

export default React.memo(CardContenido);