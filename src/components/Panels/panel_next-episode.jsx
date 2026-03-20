import React from "react";
import { View, Text, Image, StyleSheet, TouchableNativeFeedback, Platform } from 'react-native';

const PanelNextEpisode = ({ imagen, countdown, onCancel, onPlayNow }) => {
    const focusRipple = Platform.isTV ? TouchableNativeFeedback.Ripple('#FFD700', false) : TouchableNativeFeedback.Ripple('#FFFFFF40', false);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.textNetx}>Siguiente episodio en </Text>
                <Text style={styles.textCountdown}>{countdown}</Text>
            </View>
            <View style={styles.imageContainer}>
                {imagen ? (
                    <Image source={{ uri: imagen }} style={styles.image} />
                ) : (
                    <View style={styles.notImage} />
                )}
                <Image source={require('../../assets/icono_play.png')} style={styles.iconPlay} resizeMode='contain' />
            </View>
            <View style={styles.buttonsContainer}>
                <View style={styles.wrapper}>
                    <TouchableNativeFeedback
                        onPress={onCancel}
                        background={focusRipple}
                        useForeground={!Platform.isTV}
                        hasTVPreferredFocus={Platform.isTV}
                    >
                        <View style={styles.borderSimulator}>
                            <View style={[styles.button, { backgroundColor: '#333' }]}>
                                <Text style={styles.textButton}>CANCELAR</Text>
                            </View>
                        </View>
                    </TouchableNativeFeedback>
                </View>
                <View style={styles.wrapper}>
                    <TouchableNativeFeedback
                        onPress={onPlayNow}
                        background={focusRipple}
                        useForeground={!Platform.isTV}
                    >
                        <View style={styles.borderSimulator}>
                            <View style={[styles.button, { backgroundColor: '#07F' }]}>
                                <Text style={styles.textButton}>REPRODUCIR AHORA</Text>
                            </View>
                        </View>
                    </TouchableNativeFeedback>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '30%',
        height: '50%',
        position: 'absolute',
        bottom: '3%',
        right: '1.5%',
    },
    header: {
        flex: 0.12,
        flexDirection: 'row',
        paddingBottom: 2,
    },
    imageContainer: {
        flex: 0.68,
        marginBottom: 7
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
    buttonsContainer: {
        flex: 0.20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    wrapper: {
        width: '48.5%',
        borderRadius: 8,
        overflow: 'hidden'
    },
    borderSimulator: {
        flex: 1,
        padding: Platform.isTV ? 3 : 0,
    },
    button: {
        flex: 1,
        justifyContent: 'center',
        borderRadius: 5
    },
    textNetx: {
        color: '#FFF',
        fontSize: Platform.isTV ? 18 : 16,
    },
    textCountdown: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: Platform.isTV ? 18 : 16,
    },
    textButton: {
        color: '#FFF',
        textAlign: 'center',
    }
});

export default PanelNextEpisode;