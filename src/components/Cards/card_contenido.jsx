import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useSelector, useDispatch } from 'react-redux';
import { useXtream } from '../../services/hooks/useXtream';
import { changeContentProperties } from "../../services/redux/slices/streamingSlice";
import TMDBController from "../../services/controllers/tmdbController";

const tmdbController = new TMDBController;

const CardContenido = ({ navigation, tipo, contenidoId, onStartLoading, onFinishLoading }) => {
    const { getEpisodes } = useXtream();
    const dispatch = useDispatch();
    const { live, vod, series } = useSelector(state => state.streaming);
    const [error, setError] = useState(false);
    const contenido = tipo === 'live' ? live : (tipo === 'vod' ? vod : series);
    const selectedContent = contenido.find(content => (tipo === 'series' ? content.series_id : content.stream_id) === contenidoId);
    const imagen = tipo === 'series' ? selectedContent.cover : selectedContent.stream_icon;

    const handleNavigateToScreen = async () => {
        let content = {};
        let info = {};

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
                        info = await tmdbController.getDataMovie(selectedContent.title, selectedContent.year, selectedContent.release_date); //Obtiene la información general de la pelicula
                        if (info) {
                            dispatch(changeContentProperties({
                                type: tipo,
                                contentId: selectedContent.stream_id,
                                changes: { tmdb_id: info.tmdb_id }
                            }));
                        }
                    } else {
                        info = await tmdbController.getDataMovieById(selectedContent.tmdb_id);
                    }
                    onFinishLoading?.(); // Avisa a Seccion que termine el modal de carga
                    navigation.navigate('Pelicula', { selectedContent, info });
                } catch (error) {
                    //Mostrar mensaje de que no está disponible el contenido
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
                    if (!selectedContent.tmdb_id) {
                        info = await tmdbController.getDataSerie(selectedContent.title, selectedContent.year, selectedContent.release_date); //Obtiene la información general de la pelicula
                        if (info) {
                            dispatch(changeContentProperties({
                                type: tipo,
                                contentId: selectedContent.series_id,
                                changes: { tmdb_id: info.tmdb_id }
                            }));
                        }
                    } else {
                        info = await tmdbController.getDataSerieById(selectedContent.tmdb_id);
                    }
                    const episodes = await getEpisodes(selectedContent.series_id);
                    onFinishLoading?.(); // Avisa a Seccion que termine el modal de carga
                    navigation.navigate('Serie', { selectedContent, episodes, info });
                } catch (error) {
                    //Mostrar mensaje de que no está disponible el contenido
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
            onPress={handleNavigateToScreen}>
            <Image
                style={{ width: '100%', height: '100%', borderRadius: 5, }}
                source={imagen && !error ? { uri: imagen } : require('../../assets/not_image.png')}
                onError={() => setError(true)}
                resizeMode={imagen && !error ? "cover" : "contain"}
            />
            <View style={{
                position: 'absolute',
                bottom: 0, // Posiciona el texto en la parte inferior
                left: 0,
                right: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.35)', // Fondo semitransparente para el texto
                paddingVertical: 5,
                borderBottomLeftRadius: 5,
                borderBottomRightRadius: 5
            }}>
                <Text style={{ color: '#FFF', textAlign: 'center', }} numberOfLines={2}>{selectedContent.name}</Text>
            </View>
        </TouchableOpacity>
    );
}

export default CardContenido;