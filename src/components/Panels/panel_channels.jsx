import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useQuery } from '@realm/react';
import { useStreaming } from '../../services/hooks/useStreaming';
import ItemCategory from '../Items/item_category';
import ItemChannel from '../Items/item_channel';

const PanelChannels = ({ onClose, idCategorySelected, idChannelSelected, onSelectChannel }) => {
    const { getModelName, getWatchedItems, getFavoriteItems } = useStreaming();
    const categoryModel = getModelName('live', true);
    const categories = useQuery(categoryModel);
    const initialIndex = categories.findIndex(categoria => categoria.category_id === idCategorySelected);
    const [category, setCategory] = useState(categories[initialIndex]); //Estado para manejar la categoria seleccionada
    const categoryListRef = useRef(null); // Referencia para el FlatList de Categorías
    const channelListRef = useRef(null); // Referencia para el FlatList de Canales

    const contentToShow = useMemo(() => {
        let contenido = category.canales;

        if (category.category_id === '0.2') {
            contenido = getWatchedItems('live'); //Filtra el contenido 'Recientemente Visto'
        }

        if (category.category_id === '0.3') {
            contenido = getFavoriteItems('live'); //Filtra el contenido 'Favorito'
        }

        return contenido; // Retorna una colección de Realm ya filtrada y optimizada
    }, [category]);

    const getCategoryLayout = (data, index) => ({
        length: 40,
        offset: 40 * index,
        index,
    });

    const getChannelLayout = (data, index) => ({
        length: 50,
        offset: 50 * index,
        index,
    });

    // useEffect para la lista de CATEGORÍAS, se activa cuando la 'category' seleccionada cambia
    useEffect(() => {
        if (!categoryListRef.current || !categories) return;

        // Encuentra el índice de la categoría actual en la lista completa
        const targetIndex = categories.findIndex(c => c.category_id === category.category_id);

        if (targetIndex !== -1) {
            setTimeout(() => {
                categoryListRef.current.scrollToIndex({
                    index: targetIndex,
                    animated: true,
                    viewPosition: 0.5, // 0.5 intenta centrar el ítem
                });
            }, 150); // Delay para asegurar renderización
        }
    }, [category, categories]);

    // useEffect para la lista de CANALES, se activa si la lista de canales cambia (al cambiar de categoría) o si el canal seleccionado desde el reproductor cambia
    useEffect(() => {
        if (!channelListRef.current || !contentToShow) return;

        // Encuentra el índice del canal seleccionado DENTRO de la lista actual
        const targetIndex = contentToShow.findIndex(c => c.num === idChannelSelected);

        if (targetIndex !== -1) {
            // Si el canal seleccionado ESTÁ en esta lista, hace scroll
            setTimeout(() => {
                channelListRef.current.scrollToIndex({
                    index: targetIndex,
                    animated: true,
                    viewPosition: 0.5, // 0.5 intenta centrar el ítem
                });
            }, 150);
        } else {
            // Si el canal seleccionado NO está en esta lista, simplemente resetea la lista al inicio (índice 0)
            setTimeout(() => {
                channelListRef.current.scrollToIndex({
                    index: 0,
                    animated: false,
                });
            }, 150);
        }
    }, [contentToShow, idChannelSelected]);

    return (
        <View style={styles.container}>
            <View style={styles.categoriesList}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose}>
                        <Icon name="arrow-circle-left" size={26} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Lista de Canales</Text>
                </View>
                <FlatList
                    ref={categoryListRef}
                    getItemLayout={getCategoryLayout}
                    data={categories}
                    numColumns={1}
                    renderItem={({ item }) => (
                        <ItemCategory
                            categoria={item}
                            seleccionado={category.category_id}
                            seleccionar={(categoria) => setCategory(categoria)}
                            isOnReproductor={true}
                        />
                    )}
                    keyExtractor={item => item.category_id}
                    initialNumToRender={20}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    removeClippedSubviews={true}
                    updateCellsBatchingPeriod={50}
                />
            </View>
            <View style={styles.channelsList}>
                <FlatList
                    ref={channelListRef}
                    getItemLayout={getChannelLayout}
                    data={contentToShow}
                    numColumns={1}
                    renderItem={({ item }) => (
                        <ItemChannel
                            canal={item}
                            seleccionado={idChannelSelected}
                            seleccionar={(canal) => onSelectChannel(category, canal)}
                            isOnReproductor={true}
                        />
                    )}
                    keyExtractor={item => item.num}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '65%',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#666',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 15,
    },
    categoriesList: {
        flex: 4
    },
    channelsList: {
        flex: 6
    }
});

export default PanelChannels;