import React, { useEffect, useState, useRef } from "react";
import { Text, TouchableNativeFeedback, View, ScrollView, StyleSheet, BackHandler, findNodeHandle, Platform } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';

const ModalOverview = ({ openModal, handleCloseModal, overview }) => {
    const [closeFocusTag, setCloseFocusTag] = useState(null); // Estado para manejar la etiqueta del botón Cerrar para el foco de atención
    const closeRef = useRef(null); // Referencia para el botón de Cerrar

    const focusRipple = Platform.isTV ? TouchableNativeFeedback.Ripple('#000', false) : TouchableNativeFeedback.Ripple('#00000040', false);

    // useEffect para vincular el botón de Cerrar para la navegación explicita
    useEffect(() => {
        // Si no es TV o si el modal no está abierto, no hace nada
        if (!Platform.isTV || !openModal) return;

        // Timeout para asegurar que el botón de Cerrar esté montado
        const timer = setTimeout(() => {
            if (closeRef.current) {
                const closeTag = findNodeHandle(closeRef.current); // Encuentra la etiqueta del botón Cerrar
                setCloseFocusTag(closeTag); // Asigna la etiqueta del botón
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [openModal]);

    // useEffect para el manejo del botón físico "Atrás" de Android
    useEffect(() => {
        const onBackPress = () => {
            if (openModal) {
                handleCloseModal();
                return true;
            }
            return false;
        };

        BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [openModal, handleCloseModal]);

    // Si el modal no está abierto, no renderiza nada
    if (!openModal) return null;

    return (
        <View style={styles.modalOverlay} importantForAccessibility="yes">
            <View style={styles.centeredView}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <View style={{ flexDirection: 'row' }}>
                            <Icon name="info-circle" size={Platform.isTV ? 29 : 27} color="#000" />
                            <Text style={styles.textHeader}>TRAMA</Text>
                        </View>
                        <View style={styles.wrapper}>
                            <TouchableNativeFeedback
                                ref={closeRef}
                                onPress={handleCloseModal}
                                background={focusRipple}
                                useForeground={!Platform.isTV}
                                hasTVPreferredFocus={Platform.isTV}
                                nextFocusDown={closeFocusTag}
                                nextFocusUp={closeFocusTag}
                                nextFocusLeft={closeFocusTag}
                                nextFocusRight={closeFocusTag}
                            >
                                <View style={styles.borderSimulator}>
                                    <View style={{ borderRadius: 3 }}>
                                        <Icon name="window-close" size={27} color="red" />
                                    </View>
                                </View>
                            </TouchableNativeFeedback>
                        </View>
                    </View>
                    <ScrollView style={styles.content}>
                        <Text style={styles.text}>{overview}</Text>
                    </ScrollView>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5000,
    },
    centeredView: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        width: "70%",
        maxHeight: '80%',
        elevation: 10
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 2,
        borderBottomColor: '#333',
        paddingVertical: 5,
        paddingHorizontal: 20,
    },
    wrapper: {
        height: '100%',
        borderRadius: 5,
        overflow: 'hidden'
    },
    borderSimulator: {
        flex: 1,
        padding: Platform.isTV ? 3 : 0
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 5,
        paddingBottom: 10,
        maxHeight: '88%',
    },
    textHeader: {
        fontWeight: 'bold',
        fontSize: Platform.isTV ? 22 : 20,
        color: '#000',
        textAlignVertical: 'center',
        paddingLeft: 5
    },
    text: {
        fontSize: Platform.isTV ? 20 : 18,
        color: "#000",
        textAlign: 'justify',
    },
});

export default ModalOverview;