import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useQuery } from '@realm/react';
import { useStreaming } from '../../services/hooks/useStreaming';
import ItemCategory from '../Items/item_category';
import ItemChannel from '../Items/item_channel';

const PanelChannels = ({ onClose, idCategorySelected, idChannelSelected, onSelectedCategory, onSelectChannel }) => {
    const { getModelName, getWatchedItems, getFavoriteItems } = useStreaming();
    const categoryModel = getModelName('live', true);
    const categories = useQuery(categoryModel);
    const initialIndex = categories.findIndex(categoria => categoria.category_id === idCategorySelected);
    const [category, setCategory] = useState(categories[initialIndex]); //Estado para manejar la categoria seleccionada

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
                    data={categories}
                    numColumns={1}
                    renderItem={({ item }) => (
                        <ItemCategory
                            categoria={item}
                            seleccionado={category.category_id}
                            seleccionar={(categoria) => {
                                setCategory(categoria);
                                onSelectedCategory(categoria);
                            }}
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
                    data={contentToShow}
                    numColumns={1}
                    renderItem={({ item }) => (
                        <ItemChannel
                            canal={item}
                            seleccionado={idChannelSelected}
                            seleccionar={(canal) => onSelectChannel(canal)}
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