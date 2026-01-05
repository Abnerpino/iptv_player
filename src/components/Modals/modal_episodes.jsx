import React, { useEffect } from "react";
import { Text, TouchableOpacity, View, StyleSheet, FlatList, BackHandler } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import ItemEpisode from "../Items/item_episode";

const ModalEpisodes = ({ openModal, handleCloseModal, temporada, episodes, onSelectEpisode }) => {
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
                        <TouchableOpacity onPress={handleCloseModal}>
                            <Icon name="arrow-circle-left" size={26} color="#fff" style={{ marginRight: 10 }} />
                        </TouchableOpacity>
                        <Text style={styles.textHeader}>{`Episodios - Temporada ${temporada}`}</Text>
                    </View>
                    <View style={{ paddingTop: 10, paddingBottom: 40 }}>
                        <FlatList
                            data={episodes}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <ItemEpisode
                                    episode={item}
                                    onSelectEpisode={(episodio) => {
                                        onSelectEpisode(episodio);
                                        handleCloseModal();
                                    }}
                                />
                            )}
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
        backgroundColor: "rgba(0,0,0,0.75)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "100%",
        height: '100%',
        paddingRight: '2.5%'
    },
    header: {
        flexDirection: 'row',
        borderBottomWidth: 2,
        borderBottomColor: '#888',
        paddingVertical: 5,
        paddingHorizontal: 5,
    },
    textHeader: {
        fontWeight: 'bold',
        fontSize: 20,
        color: '#fff',
        textAlignVertical: 'center',
        paddingLeft: 5
    },
});

export default ModalEpisodes;