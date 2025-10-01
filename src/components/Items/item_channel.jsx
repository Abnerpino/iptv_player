import React, { useState } from 'react';
import { View, Text, TouchableHighlight, StyleSheet, Vibration } from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';
import { updateItem, saveOrUpdateItems, deleteItem } from '../../services/realm/streaming';
import { changeCategoryProperties } from '../../services/redux/slices/streamingSlice';

const ItemChannel = ({ canal, seleccionado, seleccionar }) => {
    const { catsLive } = useSelector(state => state.streaming);
    const favoritos = catsLive.find(categoria => categoria.category_id === '0.3');
    const [favorite, setFavorite] = useState(canal?.favorito ?? false);
    const dispatch = useDispatch();

    const backgroundColor = canal.num === seleccionado ? '#006172' : 'rgba(16,16,16,0)'; // Cambia el color según la selección

    const handleToggleFavorite = () => {
        const newFavoriteStatus = !favorite;

        // Verifica si el canal ya está en Favoritos (para evitar agregar de nuevo)
        if (canal?.favorito === newFavoriteStatus) return;

        Vibration.vibrate();
        setFavorite(newFavoriteStatus);

        updateItem('live', 'stream_id', canal.stream_id, { favorito: newFavoriteStatus }); // Actualiza el item en el schema principal
        saveOrUpdateItems('auxLive', { num: canal.num, stream_id: canal.stream_id, favorito: newFavoriteStatus, visto: canal.visto }); // Actualiza el item en el schema auxiliar
        if (newFavoriteStatus === false) {
            deleteItem('auxLive', canal.stream_id); // Elimina el item del schema auxiliar
        }

        const currentTotal = favoritos.total;
        let newTotal = newFavoriteStatus ? currentTotal + 1 : Math.max(0, currentTotal - 1);

        dispatch(changeCategoryProperties({
            type: 'live',
            categoryId: '0.3',
            changes: { total: newTotal }
        }));
    };

    return (
        <TouchableHighlight
            style={[styles.container, { backgroundColor }]}
            onPress={() => seleccionar(canal)}
            onLongPress={handleToggleFavorite}
            underlayColor={canal.num !== seleccionado ? "#D5700F" : "#006172"}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.textoNum}>{canal.num}</Text>
                <View style={styles.imageContainer}>
                    <FastImage
                        style={styles.imagen}
                        source={{ uri: canal.stream_icon }}
                        resizeMode="contain"
                    />
                </View>
                <Text style={styles.textoName} numberOfLines={1}>{canal.name}</Text>
                <View style={{ width: '10%' }}>
                    {canal.favorito && (
                        <Icon name={"heart"} size={20} color={"red"} />
                    )}
                </View>
            </View>
        </TouchableHighlight>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 50,
        padding: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#303030',
    },
    textoNum: {
        width: '15%',
        color: '#FFF',
        fontSize: 14,
        textAlign: 'right',
        fontWeight: 'bold',
        paddingRight: 5,
    },
    textoName: {
        width: '65%',
        color: '#FFF',
        fontSize: 16,
        paddingLeft: 10,
    },
    imageContainer: {
        width: '10%',
        alignItems: 'center',
    },
    imagen: {
        width: '100%',
        height: '100%',
        //backgroundColor: '#f00'
    }
});

export default ItemChannel;