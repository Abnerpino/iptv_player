import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ImageBackground } from 'react-native';
import TextTicker from 'react-native-text-ticker';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/SimpleLineIcons';
import Video from 'react-native-video';
import { useQuery } from '@realm/react';
import { useStreaming } from '../../services/hooks/useStreaming';
import BarraBusqueda from '../../components/BarraBusqueda';
import ItemChannel from '../../components/Items/item_channel';
import Reproductor from '../../components/Reproductor';

const Canal = ({ navigation, route }) => {
    const canal = route.params.selectedContent;
    const id_categoria = route.params.idCategory;

    const { getModelName, updateProps, getWatchedItems, getFavoriteItems } = useStreaming();
    const categoryModel = getModelName('live', true);
    const categories = useQuery(categoryModel);
    const initialIndex = categories.findIndex(categoria => categoria.category_id === id_categoria);
    const vistos = categories.find(categoria => categoria.category_id === '0.2');
    const [currentIndex, setCurrentIndex] = useState(initialIndex); //Estado para manejar el indice de la categoria actual
    const [selectedChannel, setSelectedChannel] = useState(canal); //Estado para el manejo del canal seleccionado
    const [isFullScreen, setIsFullScreen] = useState(false); //Estado para manejar la pantalla completa del reproductor
    const [searchCont, setSearchCont] = useState(''); //Estado para manejar la búsqueda de contenido

    useEffect(() => {
        // Verifica si el canal ya está en Vistos (para evitar agregar de nuevo)
        if (selectedChannel?.visto === true) return;

        updateProps('live', false, selectedChannel.stream_id, { visto: true }); // Actualiza el canal en el schema

        const currentTotal = vistos.total;
        let newTotal = currentTotal + 1;

        updateProps('live', true, vistos.category_id, { total: newTotal }); // Actualiza el total de la categoría Vistos
    }, [selectedChannel]);

    const contentToShow = useMemo(() => {
        const category = categories[currentIndex];
        let contenido = category.canales;

        if (category.category_id === '0.2') {
            contenido = getWatchedItems('live'); //Filtra el contenido 'Recientemente Visto'
        }

        if (category.category_id === '0.3') {
            contenido = getFavoriteItems('live'); //Filtra el contenido 'Favorito'
        }

        if (searchCont.trim() !== '') {
            contenido = contenido.filtered('name CONTAINS[c] $0', searchCont); //Filtra por el término de búqueda si es que existe
        }

        return contenido; // Retorna una colección de Realm ya filtrada y optimizada
    }, [categories, currentIndex, searchCont])

    // Función para ir a la categoría anterior
    const handlePrevious = () => {
        // Fórmula para retroceder y dar la vuelta al llegar al principio
        const newIndex = (currentIndex - 1 + categories.length) % categories.length;
        setCurrentIndex(newIndex);
    };

    // Función para ir a la siguiente categoría
    const handleNext = () => {
        // Fórmula para avanzar y dar la vuelta al llegar al final
        const newIndex = (currentIndex + 1) % categories.length;
        setCurrentIndex(newIndex);
    };

    // Función para actualiza el número y nombre del canal seleccionado
    function seleccionarCanal(channel) {
        if (channel.num !== selectedChannel.num) {
            setSelectedChannel(channel);
        }
    }

    const renderPlayer = () => (
        <TouchableOpacity
            style={isFullScreen ? styles.fullScreenVideo : styles.videoPlayerContainer}
            onPress={() => setIsFullScreen(!isFullScreen)} // 👈 6. Activa/desactiva la pantalla completa
        >
            <Video
                source={{ uri: selectedChannel.link }} // ⚠️ ¡IMPORTANTE! Reemplaza 'stream_url' con el nombre de la propiedad que contiene la URL del video en tu objeto 'canal'
                style={styles.videoPlayer}
                controls={true} // Muestra los controles nativos (play, pausa, etc.)
                resizeMode="contain"
                fullscreen={isFullScreen}
                onEnd={() => setIsFullScreen(false)} // Opcional: sale de pantalla completa al terminar
            />
        </TouchableOpacity>
    );

    return (
        <ImageBackground
            source={require('../../assets/fondo2.jpg')}
            style={styles.fondo}
            resizeMode='cover'
        >
            <View style={styles.opacidad}>
                <View style={styles.container}>
                    {!isFullScreen && (
                        <View style={styles.listaContainer}>
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.flechaIcono}>
                                    <Icon name="arrow-circle-left" size={26} color="white" />
                                </TouchableOpacity>
                                <Image
                                    source={require('../../assets/imagotipo_live.png')}
                                    style={styles.imagotipo}
                                />
                            </View>
                            <View style={styles.categoriaContanier}>
                                <TouchableOpacity onPress={handlePrevious} style={{ paddingHorizontal: 5 }} >
                                    <Icon2 name="arrow-left" size={26} color="white" />
                                </TouchableOpacity>
                                <View style={{ flex: 1, alignItems: categories[currentIndex].category_name.length > 28 ? 'stretch' : 'center' }}>
                                    <TextTicker
                                        style={styles.categoryText}
                                        duration={10000}
                                        loop
                                        bounce={false}
                                        repeatSpacer={100}
                                        marqueeDelay={250}
                                    >
                                        {categories[currentIndex].category_name}
                                    </TextTicker>
                                </View>
                                <TouchableOpacity onPress={handleNext} style={{ paddingHorizontal: 5 }} >
                                    <Icon2 name="arrow-right" size={26} color="white" />
                                </TouchableOpacity>
                            </View>
                            {contentToShow.length === 0 ? (
                                <View style={{ padding: 10 }}>
                                    <Text style={{ color: 'white', fontSize: 16, textAlign: 'center' }}>
                                        No se ha encontrado el canal
                                    </Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={contentToShow}
                                    numColumns={1}
                                    renderItem={({ item }) => (
                                        <ItemChannel
                                            canal={item}
                                            seleccionado={selectedChannel.num}
                                            seleccionar={(canal) => seleccionarCanal(canal)}
                                        />
                                    )}
                                    keyExtractor={item => item.num}
                                />
                            )}
                        </View>
                    )}
                    <View style={isFullScreen ? styles.fullScreenContainer : styles.reproductorContainer}>
                        {!isFullScreen && (
                            <View>
                                <View style={styles.barraContainer}>
                                    <View style={styles.busquedaContainer}>
                                        <BarraBusqueda message='Buscar canal' searchText={searchCont} setSearchText={setSearchCont} />
                                    </View>
                                    <Icon name='search' size={26} color="#FFF" style={{ marginLeft: 10 }} />
                                </View>
                                <View style={styles.textContainer}>
                                    <TextTicker
                                        style={styles.nameText}
                                        duration={10000}
                                        loop
                                        bounce={false}
                                        repeatSpacer={100}
                                        marqueeDelay={250}
                                    >
                                        {selectedChannel.name}
                                    </TextTicker>
                                </View>
                            </View>
                        )}
                        <Reproductor
                            tipo={'live'}
                            fullScreen={isFullScreen}
                            setFullScreen={(value) => setIsFullScreen(value)}
                            contenido={selectedChannel}
                            data={[]}
                        />
                    </View>
                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    fondo: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    opacidad: {
        flex: 1,
        backgroundColor: 'rgba(16,16,16,0.5)'
    },
    container: {
        flexDirection: 'row',
        flex: 1,
    },
    listaContainer: {
        flex: 4,
    },
    reproductorContainer: {
        flex: 6,
        flexDirection: 'column',
    },
    fullScreenContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 10, // Se asegura de que esté por encima de todo
    },
    barraContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 0.75,
        paddingHorizontal: 10,
    },
    busquedaContainer: {
        flex: 1,
        alignItems: 'center'
    },
    flechaIcono: {
        paddingHorizontal: 15,
        paddingVertical: 12.5
    },
    categoriaContanier: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    imagotipo: {
        height: '100%',
        width: '76%',
        resizeMode: 'contain'
    },
    textContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 11,
        paddingHorizontal: 5,
    },
    categoryText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    nameText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500'
    }
});

export default Canal;