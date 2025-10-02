import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration } from "react-native";
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSelector, useDispatch } from 'react-redux';
import { useXtream } from '../../services/hooks/useXtream';
import { updateItem, saveOrUpdateItems, deleteItem } from '../../services/realm/streaming';
import { changeCategoryProperties } from '../../services/redux/slices/streamingSlice';
import TMDBController from "../../services/controllers/tmdbController";

const tmdbController = new TMDBController;

const CardContenido = ({ navigation, tipo, item, categorias, contenido, onStartLoading, onFinishLoading }) => {
    const dispatch = useDispatch();
    const { getEpisodes } = useXtream();
    const [error, setError] = useState(false);
    const { catsLive, catsVod, catsSeries } = useSelector(state => state.streaming);

    const imagen = tipo === 'series' ? item.cover : item.stream_icon;
    const auxTipo = tipo === 'live' ? 'auxLive' : tipo === 'vod' ? 'auxVod' : 'auxSeries';
    const item_id = tipo === 'series' ? 'series_id' : 'stream_id';

    // Obtiene las categorías correctas según el tipo
    const categories = useMemo(() => {
        if (tipo === 'live') return catsLive;
        if (tipo === 'vod') return catsVod;
        return catsSeries;
    }, [tipo, catsLive, catsVod, catsSeries]);

    const favoritos = categories.find(categoria => categoria.category_id === '0.3');
    const [favorite, setFavorite] = useState(item?.favorito ?? false);

    const handleNavigateToScreen = useCallback(async () => {
        if (tipo === 'live') {
            //navigation.navigate('Reproductor', { link: item.link, name: item.name, tipo });
            navigation.navigate('Canal', { selectedContent: item, categories: categorias, content: contenido });
        }
        else if (tipo === 'vod') {
            try {
                onStartLoading?.(); // Avisa a Seccion que inicie el modal de carga
                if (!item.tmdb_id) {
                    const info = await tmdbController.getDataMovie(item.title, item.year, item.release_date); //Obtiene la información general de la pelicula
                    if (info) {
                        updateItem(
                            'vod',
                            'stream_id',
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
                        updateItem(
                            'series',
                            'series_id',
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
        const newFavoriteStatus = !favorite;

        // Verifica si el canal ya está en Favoritos (para evitar agregar de nuevo)
        if (item?.favorito === newFavoriteStatus) return;

        Vibration.vibrate();
        setFavorite(newFavoriteStatus);

        updateItem(tipo, item_id, item[item_id], { favorito: newFavoriteStatus }); // Actualiza el item en el schema principal
        saveOrUpdateItems(auxTipo, { num: item.num, [item_id]: item[item_id], favorito: newFavoriteStatus, visto: item.visto }); // Actualiza el item en el schema auxiliar
        if (newFavoriteStatus === false) {
            deleteItem(auxTipo, item[item_id]); // Elimina el item del schema auxiliar
        }

        const currentTotal = favoritos.total;
        let newTotal = newFavoriteStatus ? currentTotal + 1 : Math.max(0, currentTotal - 1);

        dispatch(changeCategoryProperties({
            type: tipo,
            categoryId: '0.3',
            changes: { total: newTotal }
        }));
    }, [tipo]);

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