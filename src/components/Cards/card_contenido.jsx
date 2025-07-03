import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useXtream } from '../../services/hooks/useXtream';
import { getItems, updateItem } from '../../services/realm/streaming';
import { changeContentProperties } from "../../services/redux/slices/streamingSlice";
import TMDBController from "../../services/controllers/tmdbController";

const tmdbController = new TMDBController;

const CardContenido = React.memo(({ navigation, tipo, item, onStartLoading, onFinishLoading }) => {
    const { getEpisodes } = useXtream();
    const dispatch = useDispatch();
    //const { live, vod, series } = useSelector(state => state.streaming);
    const [error, setError] = useState(false);
    const selectedContent = item;
    const imagen = tipo === 'series' ? selectedContent.cover : selectedContent.stream_icon;

    const handleNavigateToScreen = async () => {
        if (tipo === 'live') {
            if (selectedContent) {
                const link = selectedContent.link;
                navigation.navigate('Reproductor', { link });
            } else {
                console.log('Contenido no disponible');
            }
        }
        else if (tipo === 'vod') {
            if (selectedContent) {
                try {
                    onStartLoading?.(); // Avisa a Seccion que inicie el modal de carga
                    if (!selectedContent.tmdb_id) {
                        const info = await tmdbController.getDataMovie(selectedContent.title, selectedContent.year, selectedContent.release_date); //Obtiene la información general de la pelicula
                        if (info) {
                            updateItem(
                                'vod',
                                'stream_id',
                                selectedContent.stream_id,
                                {
                                    tmdb_id: info.tmdb_id,
                                    backdrop_path: info.backdrop_path,
                                    original_title: info.original_title,
                                    overview: info.overview,
                                    poster_path: info.poster_path,
                                    runtime: info.runtime,
                                    genres: info.genres,
                                    vote_average: info.vote_average,
                                    cast: info.cast
                                }
                            );
                        }
                    }/* else {
                        info = await tmdbController.getDataMovieById(selectedContent.tmdb_id);
                    }*/
                    onFinishLoading?.(); // Avisa a Seccion que termine el modal de carga
                    navigation.navigate('Pelicula', { selectedContent });
                } catch (error) {
                    //Mostrar mensaje de que no está disponible el contenido
                    console.log(error);
                    onFinishLoading?.(); // Avisa a Seccion que termine el modal de carga
                }

            } else {
                console.log('Contenido no disponible');
            }
        }
        else {
            if (selectedContent) {
                try {
                    onStartLoading?.(); // Avisa a Seccion que inicie el modal de carga
                    if (!selectedContent.saga && !selectedContent.tmdb_id) {
                        const info = await tmdbController.getDataSerie(selectedContent.title, selectedContent.year, selectedContent.release_date); //Obtiene la información general de la pelicula
                        if (info) {
                            updateItem(
                                'series',
                                'series_id',
                                selectedContent.series_id,
                                {
                                    tmdb_id: info.tmdb_id,
                                    original_name: info.original_name,
                                    backdrop_path_aux: info.backdrop_path,
                                    poster_path: info.poster_path,
                                    vote_average: info.vote_average,
                                    genres: info.genres,
                                    overview: info.overview,
                                    cast: info.cast
                                }
                            );
                        }
                    }/* else {
                        info = await tmdbController.getDataSerieById(selectedContent.tmdb_id);
                    }*/
                    const response = await getEpisodes(selectedContent.series_id);
                    response ? console.log('Episodios agregados') : console.log('No se agregaron los episodios');
                    onFinishLoading?.(); // Avisa a Seccion que termine el modal de carga
                    navigation.navigate('Serie', { selectedContent });
                } catch (error) {
                    //Mostrar mensaje de que no está disponible el contenido
                    console.log('CardContenido: ', error);
                    onFinishLoading?.(); // Avisa a Seccion que termine el modal de carga
                }

            } else {
                console.log('Contenido no disponible');
            }
        }
    }

    return (
        <TouchableOpacity
            style={{ margin: '1%', width: '18%', height: tipo === 'live' ? 100 : 160, borderColor: '#fff', borderWidth: 0.5, borderRadius: 5, backgroundColor: '#201F29' }}
            onPress={handleNavigateToScreen}
        >
            <Image
                style={{ width: '100%', height: '100%', borderRadius: 5, }}
                source={imagen && !error ? { uri: imagen } : require('../../assets/not_image.png')}
                onError={() => setError(true)}
                resizeMode={imagen && !error ? "cover" : "contain"}
            />
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: tipo !== 'live' && selectedContent.rating > 0 ? 'space-between' : 'flex-end',
                    position: 'absolute',
                    top: 0, // Posiciona el texto en la parte superior
                    left: 0,
                    right: 0,
                    paddingVertical: 2.5,
                    paddingHorizontal: 2.5,
                }}
            >
                {tipo !== 'live' && selectedContent.rating > 0 && (
                    <Text
                        style={{
                            backgroundColor: 'rgb(28, 134, 199)',
                            color: '#FFF',
                            fontSize: 11,
                            textAlign: 'center',
                            borderRadius: 7.5,
                            paddingVertical: 2.5,
                            paddingHorizontal: 5
                        }}
                    >
                        {selectedContent.rating}
                    </Text>
                )}
                {selectedContent.favorito && (
                    <Icon name={"heart"} size={20} color={"red"} />
                )}
            </View>
            <View
                style={{
                    position: 'absolute',
                    bottom: 0, // Posiciona el texto en la parte inferior
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.35)', // Fondo semitransparente para el texto
                    paddingVertical: 5,
                    borderBottomLeftRadius: 5,
                    borderBottomRightRadius: 5
                }}
            >
                <Text style={{ color: '#FFF', textAlign: 'center', }} numberOfLines={2}>{selectedContent.name}</Text>
            </View>
        </TouchableOpacity>
    );
});

export default CardContenido;