import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, BackHandler } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ModalError = ({ visible, error, tiempo, onClose }) => {
    // useEffect para el manejo del botón físico "Atrás" de Android
    useEffect(() => {
        const onBackPress = () => {
            if (visible) {
                onClose();
                return true;
            }
            return false;
        };

        BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [visible, onClose]);

    const typesContent = {
        live: 'TV en directo',
        vod: 'Películas',
        series: 'Series'
    };

    const formattedTime = (time) => {
        const hours = Math.floor(time / 3600);
        const mins = Math.floor((time % 3600) / 60);
        const secs = Math.floor(time % 60);
        let newTime = 'dentro de ';

        if (hours > 0) {
            newTime += `${hours} ${hours > 1 ? 'horas' : 'hora'} ${mins > 0 ? 'y ' : ''}`;
        }
        if (mins > 0) {
            newTime += `${mins} ${mins > 1 ? 'minutos' : 'minuto'}`;
        }
        if (hours === 0 && mins === 0 && secs > 0) {
            newTime += `${secs} ${secs > 1 ? 'segundos' : 'segundo'}`;
        }
        if (hours === 0 && mins === 0 && secs === 0) {
            newTime = 'ahora';
        }

        return newTime;
    };

    // Si el modal no está abierto, no renderiza nada
    if (!visible) return null;

    return (
        <View style={[styles.modalOverlay, StyleSheet.absoluteFill]}>
            <View style={styles.touchableBackground}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Icon name="report-gmailerrorred" size={27} color="red" />
                        <Text style={styles.title}>ADVERTENCIA</Text>
                    </View>
                    <View style={{ padding: 10 }}>
                        <Text style={styles.textMessage}>{`¡Ocurrió un error en la actualización ${error.length > 1 ? 'de los siguientes contenidos' : 'del siguiente contenido'}!`}</Text>
                        <View style={styles.typesContainer}>
                            {error.length > 0 && (
                                <Text style={[styles.textType, { backgroundColor: '#3D41E9' }]}>{typesContent[error[0]]}</Text>
                            )}
                            {error.length > 1 && (
                                <Text style={[styles.textType, { backgroundColor: '#DD3652' }]}>{typesContent[error[1]]}</Text>
                            )}
                            {error.length > 2 && (
                                <Text style={[styles.textType, { backgroundColor: '#9743B5' }]}>{typesContent[error[2]]}</Text>
                            )}
                        </View>
                        <Text style={styles.textMessage}>{`Debe ${error.length > 1 ? 'actualizarlos' : 'actualizarlo'} manualmente o esperar a que se ${error.length > 1 ? 'actualicen' : 'actualice'} automáticamente ${formattedTime(tiempo)}`}</Text>
                        <View style={styles.buttonsContainer}>
                            <TouchableOpacity onPress={onClose} style={styles.button}>
                                <Icon name="close" size={24} color="#FFF" />
                                <Text style={styles.textButton}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        zIndex: 9999, // Asegura que esté encima de todo
        elevation: 9999,
    },
    touchableBackground: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        width: "50%",
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#333',
        paddingVertical: 5,
        paddingHorizontal: 20,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 20,
        color: '#333',
        textAlignVertical: 'center',
        paddingLeft: 5
    },
    typesContainer: {
        alignItems: 'center',
        marginVertical: 5
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 5
    },
    button: {
        flexDirection: 'row',
        justifyContent: 'center',
        borderRadius: 5,
        padding: 5,
        width: '20%',
        backgroundColor: 'gray'
    },
    textMessage: {
        color: '#000',
        fontSize: 18,
        fontWeight: '500',
        textAlign: 'center'
    },
    textType: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '500',
        textAlign: 'center',
        width: '35%',
        borderRadius: 10,
        marginVertical: 5,
        paddingBottom: 2.5
    },
    textButton: {
        fontSize: 18,
        color: "#FFF",
        textAlign: 'center',
    },
});

export default ModalError;