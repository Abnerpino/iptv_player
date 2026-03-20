import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, TouchableNativeFeedback, FlatList, StyleSheet, BackHandler, findNodeHandle, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useStreaming } from '../../services/hooks/useStreaming';
import ItemNotification from '../Items/item_notification';

const ModalNotifications = ({ notificaciones, openModal, handleCloseModal, expiracion }) => {
    const { markNotification } = useStreaming();
    const [focusTags, setFocusTags] = useState({ close: null, notif: null }); // Estado para manejar los items registrados
    const closeRef = useRef(null); // Referencia para el botón de Cerrar
    const markedIdsRef = useRef([]); // Referencia para almacenar los IDs marcados mientras se esté mostrando el modal

    const focusRipple = Platform.isTV ? TouchableNativeFeedback.Ripple('#000', false) : TouchableNativeFeedback.Ripple('#00000040', false);

    // useEffect para reiniciar los ids marcados y vincular el botón de Cerrar para navegación explicita
    useEffect(() => {
        //Si no está abierto el modal, no hace nada
        if (!openModal) return;

        markedIdsRef.current = []; // Inicializa el arreglo de los IDs marcados

        // Si no es TV, no hace nada
        if (!Platform.isTV) return;

        // Timer para asegurar que el botón esté montado
        const timer = setTimeout(() => {
            // Si el botón de Cerrar ya está montado...
            if (closeRef.current) {
                setFocusTags(prev => ({
                    ...prev,
                    close: findNodeHandle(closeRef.current) // Obtiene su etiqueta y la asigna
                }));
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [openModal]);

    // Función para actualizar dinámicamente cualquier etiqueta de navagación de un elemento
    const updateFocusTags = (propiedad, valor) => {
        setFocusTags(prev => ({
            ...prev,
            [propiedad]: valor
        }));
    };

    // Función interna para cerrar el modal y pasar los IDs al Menú
    const onClose = () => {
        // Ejecuta la función del Menú pasando el array de IDs (vacío o con datos)
        handleCloseModal(markedIdsRef.current);
    };

    // useEffect para el manejo del botón físico "Atrás" de Android
    useEffect(() => {
        const onBackPress = () => {
            if (openModal) {
                onClose();
                return true;
            }
            return false;
        };

        BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [openModal, handleCloseModal]);

    // Funcion para manejar las notificaciones que ya han sido vistas (se debe de presionar sobre la notificación para que se considere vista)
    function verNotificacion(idNotificacion) {
        markedIdsRef.current.push(idNotificacion); // Agrega el id al array temporal
        markNotification(idNotificacion); // Marca la notificación como vista en la base de datos local
    }

    // Si el modal no está abierto, no renderiza nada
    if (!openModal) return null;

    return (
        <View style={styles.modalOverlay} importantForAccessibility="yes">
            <View style={styles.centeredView}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <View style={{ flexDirection: 'row' }}>
                            <Icon name="list-alt" size={Platform.isTV ? 29 : 27} color="#000" />
                            <Text style={styles.textHeader}>NOTIFICACIONES</Text>
                        </View>
                        <View style={styles.wrapper}>
                            <TouchableNativeFeedback
                                ref={closeRef}
                                onPress={onClose}
                                background={focusRipple}
                                useForeground={!Platform.isTV}
                                hasTVPreferredFocus={Platform.isTV}
                                nextFocusDown={focusTags.notif || focusTags.close}
                                nextFocusUp={focusTags.close}
                                nextFocusLeft={focusTags.close}
                                nextFocusRight={focusTags.close}
                            >
                                <View style={styles.borderSimulator}>
                                    <View style={{ borderRadius: 3 }}>
                                        <Icon name="window-close" size={27} color="red" />
                                    </View>
                                </View>
                            </TouchableNativeFeedback>
                        </View>
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
                                renderItem={({ item, index }) => (
                                    <ItemNotification
                                        key={index.toString()}
                                        notificacion={item}
                                        index={index}
                                        seleccionar={verNotificacion}
                                        expiracion={expiracion}
                                        closeButtonTag={focusTags.close}
                                        total={notificaciones.length}
                                        getFirstItem={updateFocusTags}
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
        paddingHorizontal: 14,
        paddingVertical: 12.5,
        maxHeight: '90%',
    },
    textHeader: {
        fontWeight: 'bold',
        fontSize: Platform.isTV ? 22 : 20,
        color: '#000',
        textAlignVertical: 'center',
        paddingLeft: 5
    },
    textMessage: {
        color: '#000',
        fontSize: Platform.isTV ? 18 : 16,
        fontStyle: 'italic',
        textAlign: 'center'
    }
});

export default ModalNotifications;