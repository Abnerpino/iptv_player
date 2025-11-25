import React, { useState } from 'react';
import { View, Image, Text, TouchableHighlight, StyleSheet, Vibration } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useQuery } from '@realm/react';
import { useStreaming } from '../../services/hooks/useStreaming';

const ItemChannel = ({ canal, seleccionado, seleccionar, isOnReproductor }) => {
    const { getModelName, updateProps } = useStreaming();
    const categoryModel = getModelName('live', true);
    const categories = useQuery(categoryModel);
    const favoritos = categories.find(categoria => categoria.category_id === '0.3');
    const [favorite, setFavorite] = useState(canal?.favorito ?? false);

    const backgroundColor = canal.num === seleccionado ? '#006172' : 'rgba(16,16,16,0)'; // Cambia el color según la selección
    const borderBottomColor = isOnReproductor ? '#999' : '#303030'; // Establece el color dependiendo de si el item se muestra dentro o fuera del reproductor

    const handleToggleFavorite = () => {
        Vibration.vibrate();

        const newFavoriteStatus = !favorite;
        setFavorite(newFavoriteStatus);

        updateProps('live', false, canal.stream_id, { favorito: newFavoriteStatus }); // Actualiza el item en el schema

        const currentTotal = favoritos.total;
        let newTotal = newFavoriteStatus ? currentTotal + 1 : Math.max(0, currentTotal - 1);

        updateProps('live', true, favoritos.category_id, { total: newTotal }); // Actualiza el total de la categoría Favoritos
    };

    return (
        <TouchableHighlight
            style={[styles.container, { backgroundColor, borderBottomColor }]}
            onPress={() => seleccionar(canal)}
            onLongPress={handleToggleFavorite}
            underlayColor={canal.num !== seleccionado ? "#D5700F" : "#006172"}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.textoNum}>{canal.num}</Text>
                <View style={styles.imageContainer}>
                    <Image
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
    }
});

export default ItemChannel;