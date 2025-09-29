import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ImageBackground } from 'react-native';
import TextTicker from 'react-native-text-ticker';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/SimpleLineIcons';
import BarraBusqueda from '../../components/BarraBusqueda';
import ItemChannel from '../../components/Items/item_channel';

const Canal = ({ navigation, route }) => {
    const canal = route.params.selectedContent;
    const categorias = route.params.categories;
    const contenido = route.params.content;

    const [currentIndex, setCurrentIndex] = useState(0); //Estado para manejar el indice de la categoria actual
    const [selectedNum, setSelectedNum] = useState(canal.num); //Estado para el manejo del número del canal seleccionada
    const [selectedName, setSelectedName] = useState(canal.name); //Estado para el manejo del nombre del canal seleccionado

    // Función para ir a la categoría anterior
    const handlePrevious = () => {
        // Fórmula para retroceder y dar la vuelta al llegar al principio
        const newIndex = (currentIndex - 1 + categorias.length) % categorias.length;
        setCurrentIndex(newIndex);
    };

    // Función para ir a la siguiente categoría
    const handleNext = () => {
        // Fórmula para avanzar y dar la vuelta al llegar al final
        const newIndex = (currentIndex + 1) % categorias.length;
        setCurrentIndex(newIndex);
    };

    // Función para actualiza el número y nombre del canal seleccionado
    function seleccionarCanal(channel) {
        if (channel.num !== selectedNum) {
            setSelectedNum(channel.num);
            setSelectedName(channel.name);
        }
    }

    return (
        <ImageBackground
            source={require('../../assets/fondo2.jpg')}
            style={styles.fondo}
            resizeMode='cover'
        >
            <View style={styles.opacidad}>
                <View style={styles.container}>
                    <View style={styles.listaContainer}>
                        <View style={styles.logoContainer}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.flechaIcono}>
                                <Icon name="arrow-circle-left" size={26} color="white" />
                            </TouchableOpacity>
                            <View style={{ flex: 1 }}>
                                <Image
                                    source={require('../../assets/imagotipo_live.png')}
                                    style={styles.imagotipo}
                                />
                            </View>
                        </View>
                        <View style={styles.categoriaContanier}>
                            <TouchableOpacity onPress={handlePrevious} style={{ paddingHorizontal: 5 }} >
                                <Icon2 name="arrow-left" size={26} color="white" />
                            </TouchableOpacity>
                            <View style={{ flex: 1, alignItems: categorias[currentIndex].category_name.length > 28 ? 'stretch' : 'center' }}>
                                <TextTicker
                                    style={styles.categoryText}
                                    duration={10000}
                                    loop
                                    bounce={false}
                                    repeatSpacer={100}
                                    marqueeDelay={250}
                                >
                                    {categorias[currentIndex].category_name}
                                </TextTicker>
                            </View>
                            <TouchableOpacity onPress={handleNext} style={{ paddingHorizontal: 5 }} >
                                <Icon2 name="arrow-right" size={26} color="white" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={contenido}
                            numColumns={1}
                            renderItem={({ item }) => (
                                <ItemChannel
                                    canal={item}
                                    seleccionado={selectedNum}
                                    seleccionar={seleccionarCanal}
                                />
                            )}
                            keyExtractor={item => item.num}
                        />

                    </View>
                    <View style={styles.reproductorContainer}>
                        <View style={styles.barraContainer}>
                            <View style={styles.busquedaContainer}>
                                <BarraBusqueda message='Buscar canal' searchText={''} />
                            </View>
                            <TouchableOpacity style={styles.searchBarIcono}>
                                <Icon name='search' size={20} color="#FFF" />
                            </TouchableOpacity>
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
                                {selectedName}
                            </TextTicker>
                        </View>
                        <View style={{ width: '100%', height: '100%', backgroundColor: '#000' }} >

                        </View>
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
        //backgroundColor: '#ff0'
    },
    reproductorContainer: {
        flex: 6,
        //backgroundColor: '#0ff'
    },
    logoContainer: {
        flexDirection: 'row',
        height: '12.5%',
        //backgroundColor: '#0f5'
    },
    barraContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 0.75,
        paddingHorizontal: 10,
        //backgroundColor: '#00f'
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
        height: '10%',
        flexDirection: 'row',
        alignItems: 'center',
        //backgroundColor: 'grey',
    },
    searchBarIcono: {
        marginLeft: 10,
        marginRight: 5
    },
    imagotipo: {
        height: '100%',
        width: '100%',
        resizeMode: 'contain'
    },
    textContainer: {
        height: '10%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
        //backgroundColor: 'red'
    },
    categoryText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        //backgroundColor: 'blue'
    },
    nameText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500'
    }
});

export default Canal;