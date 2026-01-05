import React, { useEffect } from "react";
import { Text, TouchableOpacity, View, ScrollView, StyleSheet, BackHandler } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';

const ModalOverview = ({ openModal, handleCloseModal, overview }) => {
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
        <View style={[styles.modalOverlay, StyleSheet.absoluteFill]}>
            <View style={styles.touchableBackground}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <View style={{ flexDirection: 'row' }}>
                            <Icon name="info-circle" size={27} color="#333" />
                            <Text style={styles.textHeader}>TRAMA</Text>
                        </View>
                        <TouchableOpacity onPress={handleCloseModal}>
                            <Icon name="window-close" size={27} color="red" />
                        </TouchableOpacity>
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
        zIndex: 9999,
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
        width: "70%",
        maxHeight: '80%'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 2,
        borderBottomColor: '#333',
        paddingVertical: 5,
        paddingHorizontal: 20,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 5,
        paddingBottom: 10,
        maxHeight: '88%',
    },
    textHeader: {
        fontWeight: 'bold',
        fontSize: 20,
        color: '#333',
        textAlignVertical: 'center',
        paddingLeft: 5
    },
    text: {
        fontSize: 18,
        color: "#333",
        textAlign: 'justify',
    },
});

export default ModalOverview;