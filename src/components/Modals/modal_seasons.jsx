import React, { useEffect, useState, useRef, useCallback } from "react";
import { Text, TouchableNativeFeedback, View, StyleSheet, ScrollView, BackHandler, findNodeHandle, Platform } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import ItemSeason from "../Items/item_season";

const ModalSeasons = ({ openModal, handleCloseModal, seasons, indexSelectedSeason, onSelectSeason }) => {
    const closeRef = useRef(null); // Referencia para el botón de cerrar
    const [closeButtonTag, setCloseButtonTag] = useState(null); // Estado para manejar la etiqueta del botón de cerrar
    const [itemsRegistry, setItemsRegistry] = useState({}); // Estado para manejar los items registrados

    const focusRipple = Platform.isTV ? TouchableNativeFeedback.Ripple('#000', false) : TouchableNativeFeedback.Ripple('#00000080', false);

    // useEffect para vincular el botón de Cerrar para navegación explicita
    useEffect(() => {
        // Si no es TV o si no está abierto el modal, no hace nada
        if (!Platform.isTV || !openModal) return;

        // Timeout para aseguar que el botón esté montado
        const timer = setTimeout(() => {
            if (closeRef.current) {
                setCloseButtonTag(findNodeHandle(closeRef.current));
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [openModal]);

    // Función para manejar el registro de items
    const handleRegisterItem = useCallback((index, tag) => {
        setItemsRegistry(prev => {
            // Evita actualizaciones redundantes
            if (prev[index] === tag) return prev;
            return { ...prev, [index]: tag };
        });
    }, []);

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

    // Etiqueta del primer elemento (Item 0)
    const firstItemTag = itemsRegistry[0];

    // Si el modal no está abierto, no renderiza nada
    if (!openModal) return null;

    return (
        <View style={styles.modalOverlay} importantForAccessibility="yes">
            <View style={styles.centeredView}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <View style={{ flexDirection: 'row' }}>
                            <Icon name="list-alt" size={Platform.isTV ? 29 : 27} color="#000" />
                            <Text style={styles.textHeader}>TEMPORADAS</Text>
                        </View>
                        <View style={styles.closeWrapper}>
                            <TouchableNativeFeedback
                                ref={closeRef}
                                onPress={handleCloseModal}
                                background={focusRipple}
                                useForeground={!Platform.isTV}
                                hasTVPreferredFocus={Platform.isTV}
                                nextFocusDown={firstItemTag || closeButtonTag}
                                nextFocusUp={closeButtonTag}
                                nextFocusLeft={closeButtonTag}
                                nextFocusRight={closeButtonTag}
                            >
                                <View style={styles.borderSimulator}>
                                    <View style={{ borderRadius: 3 }}>
                                        <Icon name="window-close" size={27} color="red" />
                                    </View>
                                </View>
                            </TouchableNativeFeedback>
                        </View>
                    </View>
                    <View style={styles.contentContainer}>
                        <ScrollView style={{ flexGrow: 0, width: '100%' }}>
                            <View style={styles.gridContainer}>
                                {seasons.map((item, index) => (
                                    <ItemSeason
                                        key={index.toString()}
                                        item={item}
                                        index={index}
                                        selected={indexSelectedSeason === index}
                                        totalItems={seasons.length}
                                        onPress={() => {
                                            onSelectSeason(index);
                                            handleCloseModal();
                                        }}
                                        closeButtonTag={closeButtonTag}
                                        registry={itemsRegistry}
                                        onRegister={handleRegisterItem}
                                    />
                                ))}
                            </View>
                        </ScrollView>
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
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#FFF",
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
    closeWrapper: {
        height: '100%',
        borderRadius: 5,
        overflow: 'hidden'
    },
    borderSimulator: {
        flex: 1,
        padding: Platform.isTV ? 3 : 0
    },
    contentContainer: {
        width: '100%',
        padding: 10,
        maxHeight: '88%',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        overflow: 'hidden'
    },
    textHeader: {
        fontWeight: 'bold',
        fontSize: Platform.isTV ? 22 : 20,
        color: '#000',
        textAlignVertical: 'center',
        paddingLeft: 5
    },
});

export default ModalSeasons;