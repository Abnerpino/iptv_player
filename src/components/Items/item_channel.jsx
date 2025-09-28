import React, { useState } from 'react';
import { View, Text, TouchableHighlight, StyleSheet, } from 'react-native';
import FastImage from 'react-native-fast-image';

const ItemChannel = ({ canal, seleccionado, seleccionar }) => {
    const backgroundColor = canal.num === seleccionado ? '#006172' : 'rgba(16,16,16,0)'; // Cambia el color según la selección

    const handleSelectionChannel = () => {
        seleccionar(canal);
    };

    return (
        <TouchableHighlight
            style={[styles.container, { backgroundColor }]}
            onPress={handleSelectionChannel}
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
        backgroundColor: 'rgba(16,16,16,0)',
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
        width: '75%',
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