import React, { useEffect } from "react";
import { Text, TouchableOpacity, View, StyleSheet, FlatList, BackHandler } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';

const ModalSeasons = ({ openModal, handleCloseModal, seasons, onSelectSeason }) => {
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
                            <Icon name="list-alt" size={27} color="#333" />
                            <Text style={styles.textHeader}>TEMPORADAS</Text>
                        </View>
                        <TouchableOpacity onPress={handleCloseModal}>
                            <Icon name="window-close" size={27} color="red" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.content}>
                        <FlatList
                            data={seasons}
                            numColumns={4}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.buttonSeason}
                                    onPress={() => {
                                        onSelectSeason(item); // Envía la temporada seleccionada a Serie
                                        handleCloseModal();   // Cierra el modal
                                    }}
                                >
                                    <Text style={styles.text}>{`Temporada ${item.numero}`}</Text>
                                </TouchableOpacity>
                            )}
                            keyExtractor={item => item.numero}
                        />
                    </View>
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
        paddingHorizontal: 14,
        paddingVertical: 10,
        maxHeight: '88%',
    },
    textHeader: {
        fontWeight: 'bold',
        fontSize: 20,
        color: '#333',
        textAlignVertical: 'center',
        paddingLeft: 5
    },
    buttonSeason: {
        backgroundColor: '#007BFF',
        borderRadius: 5,
        padding: 10,
        margin: 6,
        width: '23%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        fontSize: 16,
        color: "#FFF",
        textAlign: 'center',
    },
});

export default ModalSeasons;