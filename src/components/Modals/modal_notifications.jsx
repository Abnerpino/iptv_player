import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, BackHandler } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useStreaming } from '../../services/hooks/useStreaming';
import ItemNotification from '../Items/item_notification';

const ModalNotifications = ({ notificaciones, openModal, handleCloseModal, expiracion }) => {
    const { markNotification } = useStreaming();

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

    // Funcion para controlar las notificaciones que ya han sido vistas (se debe de presionar sobre la notificación para que se considere vista)
    function verNotificacion(idNotificacion) {
        markNotification(idNotificacion);
    }

    // Si el modal no está abierto, no renderiza nada
    if (!openModal) return null;

    return (
        <View style={[styles.modalOverlay, StyleSheet.absoluteFill]}>
            <View style={styles.touchableBackground} activeOpacity={1} onPressOut={handleCloseModal}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <View style={{ flexDirection: 'row' }}>
                            <Icon name="list-alt" size={27} color="#333" />
                            <Text style={styles.textHeader}>NOTIFICACIONES</Text>
                        </View>
                        <TouchableOpacity onPress={handleCloseModal}>
                            <Icon name="window-close" size={27} color="red" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.content}>
                        {!notificaciones || notificaciones.length === 0 ? (
                            <Text style={styles.textMessage}>
                                Sin notificaciones
                            </Text>
                        ) : (
                            <FlatList
                                data={notificaciones}
                                numColumns={1}
                                renderItem={({ item }) => (
                                    <ItemNotification
                                        notificacion={item}
                                        seleccionar={verNotificacion}
                                        expiracion={expiracion}
                                        flag={item.id === notificaciones[notificaciones.length - 1].id ? true : false}
                                    />
                                )}
                                keyExtractor={item => item.id.toString()}
                            />
                        )}
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
        paddingVertical: 12.5,
        maxHeight: '88%',
    },
    textHeader: {
        fontWeight: 'bold',
        fontSize: 20,
        color: '#333',
        textAlignVertical: 'center',
        paddingLeft: 5
    },
    textMessage: {
        color: '#000',
        fontSize: 16,
        fontStyle: 'italic',
        textAlign: 'center'
    }
});

export default ModalNotifications;