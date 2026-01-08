import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, FlatList, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Image, ImageBackground, Vibration, BackHandler, Keyboard } from 'react-native';
import TextTicker from 'react-native-text-ticker';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/SimpleLineIcons';
import { useObject, useQuery } from '@realm/react';
import { showMessage, hideMessage } from 'react-native-flash-message';
import { getCrashlytics, log } from '@react-native-firebase/crashlytics';
import { useStreaming } from '../../services/hooks/useStreaming';
import SearchBar from '../../components/SearchBar';
import ItemChannel from '../../components/Items/item_channel';
import Reproductor from '../../components/Reproductor';
import ErrorLogger from '../../services/logger/errorLogger';

const Canal = ({ navigation, route }) => {
    const { idContent, idCategory, username } = route.params;
    const canal = useObject('Canal', idContent); // Encuentra el canal usando su Modelo y su ID

    const { getModelName, updateProps, getWatchedItems, getFavoriteItems } = useStreaming();
    const categoryModel = getModelName('live', true); //Obtiene el nombre del modelo para las categorias de 'live'
    const categories = useQuery(categoryModel); //Obtiene las categorias con base en el modelo
    const initialCategoryIndex = categories.findIndex(categoria => categoria.category_id === idCategory); //Almacena el indice de la categoría inicial
    const vistos = categories.find(categoria => categoria.category_id === '0.2'); //Busca y asigna la categoria 'Recientemente Vistos'
    const [currentIndex, setCurrentIndex] = useState(initialCategoryIndex); //Estado para manejar el indice de la categoria actual
    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(initialCategoryIndex); //Estado para manejar el indice de la categoria del canal seleccionado
    const [selectedChannel, setSelectedChannel] = useState(canal); //Estado para el manejo del canal seleccionado
    const initialChannelIndex = categories[initialCategoryIndex].canales.findIndex(channel => channel.stream_id === selectedChannel.stream_id); //Almacena el indice del canal inicial
    const [selectedChannelIndex, setSelectedChannelIndex] = useState(initialChannelIndex); //Estado para manejar el indice del canal seleccionado
    const [isFullScreen, setIsFullScreen] = useState(false); //Estado para manejar la pantalla completa del reproductor
    const [searchCont, setSearchCont] = useState(''); //Estado para manejar la búsqueda de contenido
    const [reproductorHeight, setReproductorHeight] = useState(null); //Estado para guardar la altura dinámica del reproductor
    const flatListRef = useRef(null);

    const handleToggleWatched = () => {
        // Verifica si el canal ya está en Vistos (para evitar agregar de nuevo)
        if (selectedChannel?.visto === true) return;

        updateProps('live', false, selectedChannel.stream_id, { visto: true }); // Actualiza el canal en el schema

        const currentTotal = vistos.total;
        let newTotal = currentTotal + 1;

        updateProps('live', true, vistos.category_id, { total: newTotal }); // Actualiza el total de la categoría Vistos
    };

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
    }, [categories, currentIndex, searchCont]);

    // Se ejecuta cada vez que la pantalla Canal está enfocada
    useFocusEffect(
        useCallback(() => {
            const crashlytics = getCrashlytics(); // Obtiene la instancia de Crashlytics
            log(crashlytics, `Canal (${selectedChannel.stream_id}${isFullScreen ? ' - FullScreen' : ''})`); // Establece el mensaje
        }, [selectedChannel.stream_id, isFullScreen]) // Se reejecuta cada vez que cambian las dependencias
    );

    useEffect(() => {
        // Sale si la ref de la FlatList aún no está lista
        if (!flatListRef.current) {
            return;
        }

        try {
            // Comprueba si la categoría actual es la que contiene el canal seleccionado
            if (currentIndex === selectedCategoryIndex) {

                // Encuentra el índice del canal seleccionado DENTRO de la lista actual (contentToShow)
                const targetIndex = contentToShow.findIndex(
                    channel => channel.stream_id === selectedChannel.stream_id
                );

                // Si encuentra el canal en la lista actual, se desplaza a él
                if (targetIndex !== -1) {
                    // Se usa setTimeout para darle tiempo a la FlatList a renderizar los nuevos items antes de hacer el desplazamiento
                    setTimeout(() => {
                        flatListRef.current?.scrollToIndex({
                            index: targetIndex,
                            animated: false,
                            viewPosition: 0, // 0 = arriba, 0.5 = centro
                        });
                    }, 150); // Un pequeño delay de 150ms para dar tiempo a que termine de renderizar
                }
            } else {
                // Si cambia a una categoría que NO tiene el canal seleccionado, se asegura de que la lista comience desde el principio (índice 0)
                setTimeout(() => {
                    flatListRef.current?.scrollToIndex({
                        index: 0,
                        animated: false,
                    });
                }, 150);
            }
        } catch (error) {
            ErrorLogger.log('Canal - useEffect de scroll en FlaList', error);
        }

    }, [currentIndex, selectedCategoryIndex, contentToShow, selectedChannel, isFullScreen]);

    useEffect(() => {
        const backAction = () => {
            handleBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

        return () => backHandler.remove();
    }, []);

    const getItemLayout = (data, index) => ({
        length: 50,
        offset: 50 * index,
        index,
    });

    const handleBack = () => {
        hideMessage();
        navigation.goBack();
    };

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

    // Función para actualizar el indice de la categoría seleccionada desde el panel del reproductor
    function seleccionarCategoria(category) {
        const newIndex = categories.findIndex(categoria => categoria.category_id === category.category_id);

        if (selectedCategoryIndex !== newIndex) {
            setCurrentIndex(newIndex); // Actualiza el nuevo indice actual
            setSelectedCategoryIndex(newIndex); // Actualiza el nuevo indice de la categoria del canal seleccionado
        }
    }

    // Función para actualiza el número y nombre del canal seleccionado
    function seleccionarCanal(category, channel) {
        if (channel.num !== selectedChannel.num) { // Si es un canal diferente al que estaba seleccionado...
            const newIndex = category.canales.findIndex(c => c.stream_id === channel.stream_id);
            setSelectedChannelIndex(newIndex);
            setSelectedChannel(channel); // Actualiza el nuevo canal seleccionado
            seleccionarCategoria(category); // Llama a la función para actualizar la categoría seleccionada
        } else { // Si es el mismo canal que estaba seleccionado...
            if (!isFullScreen) { // Si la pantalla no está completa...
                setIsFullScreen(true); // Activa la pantalla completa
            }
        }
    }

    return (
        <ImageBackground
            source={require('../../assets/fondo2.jpg')}
            style={styles.fondo}
            resizeMode='cover'
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.opacidad}>
                    <View style={styles.container}>
                        {!isFullScreen && (
                            <View style={styles.listaContainer}>
                                <View style={{ flexDirection: 'row' }}>
                                    <TouchableOpacity
                                        style={styles.flechaIcono}
                                        onPress={handleBack}
                                        onLongPress={() => showToast('Regresar')}
                                    >
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
                                        ref={flatListRef}
                                        data={contentToShow}
                                        numColumns={1}
                                        renderItem={({ item }) => (
                                            <ItemChannel
                                                canal={item}
                                                seleccionado={selectedChannel.num}
                                                seleccionar={(canal) => {
                                                    Keyboard.dismiss(); // Si el teclado se está mostrando, lo oculta al seleccionar un canal
                                                    seleccionarCanal(categories[currentIndex], canal);
                                                }}
                                            />
                                        )}
                                        keyExtractor={item => item.num}
                                        getItemLayout={getItemLayout}
                                        initialNumToRender={15}
                                        keyboardShouldPersistTaps="handled"
                                        keyboardDismissMode="on-drag"
                                    />
                                )}
                            </View>
                        )}
                        <View style={isFullScreen ? styles.fullScreenContainer : styles.reproductorContainer}>
                            {!isFullScreen && (
                                <View>
                                    <View style={styles.barraContainer}>
                                        <View style={styles.busquedaContainer}>
                                            <SearchBar message='Buscar canal' searchText={searchCont} setSearchText={setSearchCont} />
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
                            <View
                                style={[
                                    !isFullScreen ? styles.reproductor : { flex: 1 },
                                    (!isFullScreen && reproductorHeight) ? { height: reproductorHeight, flex: 0 } : {}
                                ]}
                                onLayout={(event) => {
                                    if (!isFullScreen && !reproductorHeight) {
                                        const { height } = event.nativeEvent.layout;
                                        setReproductorHeight(height);
                                    }
                                }}
                            >
                                <Reproductor
                                    tipo={'live'}
                                    fullScreen={isFullScreen}
                                    setFullScreen={(value) => setIsFullScreen(value)}
                                    categoria={categories[selectedCategoryIndex]}
                                    channelIndex={selectedChannelIndex}
                                    contenido={selectedChannel}
                                    onContentChange={seleccionarCanal}
                                    markAsWatched={handleToggleWatched}
                                    username={username}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
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
        paddingLeft: '1.75%',
        paddingRight: '2%',
    },
    fullScreenContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 10,
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
    },
    reproductor: {
        flex: 1,
        marginHorizontal: 5,
        marginBottom: 2.5,
        borderRadius: 15,
        borderWidth: 3,
        overflow: 'hidden',
        borderColor: '#999',
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

export default Canal;