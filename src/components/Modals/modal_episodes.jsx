import React, { useEffect } from "react";
import { Text, View, StyleSheet, FlatList, BackHandler, Platform } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import RippleButton from "../RippleButton/ripple_button";
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
        <View style={styles.modalOverlay} importantForAccessibility="yes">
            <View style={styles.centeredView}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <RippleButton
                            mainStyle={{ marginRight: 10 }}
                            iconLib={Icon}
                            name="arrow-circle-left"
                            onPress={handleCloseModal}
                            hasTVPreferredFocus={Platform.isTV}
                        />
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
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5000,
    },
    centeredView: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.75)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "100%",
        height: '100%',
        paddingTop: '1%',
        paddingHorizontal: '1%',
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        borderBottomWidth: 2,
        borderBottomColor: '#888',
        paddingVertical: 10,
        paddingHorizontal: 10,
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