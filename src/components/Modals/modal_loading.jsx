import React, { useRef, useEffect, useState } from 'react';
import { Modal, Animated, StyleSheet, View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const ModalLoading = ({ visible }) => {
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const [dots, setDots] = useState(''); // Estado para manejar los puntos del mensaje "Cargando"

    // Animación de rotación
    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    // Animación de puntos "..."
    useEffect(() => {
        let count = 0;
        const interval = setInterval(() => {
            setDots('.'.repeat((count % 4))); // '', '.', '..', '...'
            count++;
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.modalContainer}>
                <Animated.View style={[styles.circleContainer, { transform: [{ rotate: spin }] }]}>
                    <Svg width={100} height={100} viewBox="0 0 100 100">
                        <Path
                            d="M50 10 A 40 40 0 0 1 90 50"
                            fill="none"
                            stroke="#FFF"
                            strokeWidth={5}
                            strokeLinecap="round"
                        />
                    </Svg>
                </Animated.View>
                <Text style={styles.text}>Cargando{dots}</Text>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.75)",
        justifyContent: 'center',
        alignItems: 'center',
    },
    circleContainer: {
        width: 100,
        height: 100,
        marginBottom: 16,
        justifyContent: 'center',
        alignItems: 'center',
      },
    text: {
        fontSize: 18,
        fontWeight: '500',
        color: '#FFF',
      },
});

export default ModalLoading;
