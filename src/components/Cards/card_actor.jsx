import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';

const CardActor = ({ imagen, nombre }) => {
    return (
        <View style={styles.container}>
            <FastImage
                source={{
                    uri: imagen,
                    priority: FastImage.priority.normal
                }}
                style={styles.imagen}
                resizeMode={FastImage.resizeMode.cover}
            />
            <View style={styles.textContainer}>
                <Text
                    style={styles.texto}
                    numberOfLines={2}
                >{nombre}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative'
    },
    imagen: {
        width: 100,
        height: 150,
        backgroundColor: '#201F29',
        borderRadius: 5,
        borderColor: '#fff',
        borderWidth: 0.5
    },
    textContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        padding: 5,
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5,
    },
    texto: {
        color: 'white',
        fontSize: 13,
        textAlign: 'center'
    },
});

export default CardActor;