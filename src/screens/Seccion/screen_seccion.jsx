import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import MenuLateral from '../../components/MenuLateral';
import CardItem from '../../components/Cards/card_item';
import Icon from 'react-native-vector-icons/FontAwesome';

const Seccion = ({ navigation, route }) => {
    const type = route.params.tipo; //Obtiene el tipo de Multimedia seleccionada
    const categories = route.params.categorias; //Obtiene todas las categorias de la Multimedia
    const content = route.params.contenido; //Obtiene todo el contenido de la Multimedia

    const [category, setCategory] = useState('TODO'); //Estado para manejar el nombre de la categoria seleccionada
    const [selectedId, setSelectedId] = useState(1); //Estado para el manejo del ID de la categoria seleccionada
    const [contenido, setContenido] = useState(content);

    function seleccionarCategoria(idCategoria) {
        if (idCategoria !== selectedId) {
            setSelectedId(idCategoria);
            const nameCategory = categories.find(item => item.id === idCategoria);
            setCategory(nameCategory.name);
            if (nameCategory.name !== 'TODO') {
                const newContent = [];
                content.map(content => {
                    if (nameCategory.name === content['group-title']) {
                        newContent.push(content);
                    }
                });
                setContenido(newContent);
            } else {
                setContenido(content);
            }
        }
    }

    return (
        <View style={{ flexDirection: 'column', flex: 1, backgroundColor: '#000' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingLeft: 10 }}>
                    <Icon name="arrow-circle-left" size={26} color="white"/>
                </TouchableOpacity>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={styles.sectionTitle}>{category}</Text>
                </View>
            </View>
            <View style={styles.container}>
                <View style={styles.menuContainer}>
                    <Text style={styles.menuTitle}>Buscar en categorias</Text>
                    <FlatList
                        data={categories}
                        numColumns={1}
                        renderItem={({ item }) => (
                            <MenuLateral
                                categoria={item}
                                seleccionado={selectedId}
                                seleccionar={seleccionarCategoria}
                            />
                        )}
                        keyExtractor={item => item.id}

                    />
                </View>
                <View style={styles.peliculasContainer}>
                    <FlatList
                        data={contenido}
                        numColumns={5}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <CardItem
                                navigation={navigation}
                                id={item.id}
                                imagen={item['tvg-logo']}
                                titulo={item['tvg-name']}
                                link={item.link}
                                temporadas={item.temporadas}
                                tipo={type}
                            />
                        )}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flex: 1,
        backgroundColor: '#000',
    },
    menuContainer: {
        width: '25%',
        backgroundColor: '#101010',
    },
    menuTitle: {
        color: '#FFF',
        fontSize: 16,
        marginBottom: 10,
    },
    peliculasContainer: {
        width: '75%',
    },
    sectionTitle: {
        color: '#FFF',
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    movieItem: {
        flex: 1,
        margin: 5,
    },
    movieImage: {
        width: 120,
        height: 180,
        borderRadius: 5,
    },
    ratingContainer: {
        position: 'absolute',
        top: 5,
        left: 5,
        backgroundColor: '#007ACC',
        padding: 2,
        borderRadius: 3,
    },
    ratingText: {
        color: '#FFF',
        fontSize: 12,
    },
    movieTitle: {
        color: '#FFF',
        fontSize: 12,
        marginTop: 5,
    },
    movieYear: {
        color: '#FFF',
        fontSize: 10,
    },
});

export default Seccion;
