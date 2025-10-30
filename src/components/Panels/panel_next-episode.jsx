import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const PanelNextEpisode = ({ imagen, countdown, onCancel, onPlayNow }) => {

    return (
        <View style={styles.container}>
            <View style={{ flex: 0.12, flexDirection: 'row', paddingBottom: 2 }}>
                <Text style={styles.textNetx}>Siguiente episodio en </Text>
                <Text style={styles.textCountdown}>{countdown}</Text>
            </View>
            <View style={{ flex: 0.68, marginBottom: 7 }}>
                {imagen ? (
                    <Image source={{ uri: imagen }} style={styles.image} />
                ) : (
                    <View style={styles.notImage} />
                )}
                <Image source={require('../../assets/icono_play.png')} style={styles.iconPlay} resizeMode='contain' />
            </View>
            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={[styles.button, { backgroundColor: '#333' }]} onPress={onCancel}>
                    <Text style={styles.textButton}>CANCELAR</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, { backgroundColor: '#07F' }]} onPress={onPlayNow}>
                    <Text style={styles.textButton}>REPRODUCIR AHORA</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '28%',
        height: '43%',
        position: 'absolute',
        bottom: 15,
        right: 15,
    },
    buttonsContainer: {
        flex: 0.20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 0.1,
    },
    notImage: {
        width: '100%',
        height: '100%',
        borderRadius: 2,
        borderColor: '#fff',
        borderWidth: 0.1,
    },
    iconPlay: {
        width: '35%',
        height: '35%',
        position: 'absolute',
        top: '30%',
        left: '30%',
        zIndex: 10,
    },
    button: {
        width: '48.5%',
        justifyContent: 'center',
        borderRadius: 5
    },
    textNetx: {
        color: '#FFF',
    },
    textCountdown: {
        color: '#FFF',
        fontWeight: 'bold'
    },
    textButton: {
        color: '#FFF',
        textAlign: 'center',
    }
});

export default PanelNextEpisode;