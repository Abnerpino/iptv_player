import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableNativeFeedback, StyleSheet, BackHandler, findNodeHandle, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon3 from 'react-native-vector-icons/FontAwesome';

const ModalConfirmation = ({ visible, onConfirm, onCancel, onRequestClose, numdId, itemName, navigation }) => {
    const [focusTags, setFocusTags] = useState({ confirm: null, cancel: null, about: null }); // Estado para manejar las etiquetas de los botones para navegación explicita
    const confirmRef = useRef(null); // Referencia para el botón de Confirmar
    const cancelRef = useRef(null); // Referencia para el botón de Cancelar
    const aboutRef = useRef(null); // Referencia para el botón 'Sobre la App'

    const focusRipple = Platform.isTV ? TouchableNativeFeedback.Ripple('#000', false) : TouchableNativeFeedback.Ripple('#00000040', false);

    // Efecto para vincular la navegación explicita
    useEffect(() => {
        // Si no es TV o si el modal no está abierto, no hace nada
        if (!Platform.isTV || !visible) return;

        // Timeout para asegurar que los botones estén montados
        const timer = setTimeout(() => {
            if (confirmRef.current && cancelRef.current) {
                const confirmTag = findNodeHandle(confirmRef.current); // Encuentra la etiqueta del botón Confirmar
                const cancelTag = findNodeHandle(cancelRef.current); // Encuentra la etiqueta del botón Cancelar
                const aboutTag = aboutRef.current ? findNodeHandle(aboutRef.current) : null; // Encuentra la etiqueta del botón 'Sobre la App'
                setFocusTags({ confirm: confirmTag, cancel: cancelTag, about: aboutTag }); // Asigna las etiquetas de los botones
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [visible]);

    // useEffect para el manejo del botón físico "Atrás" de Android
    useEffect(() => {
        const onBackPress = () => {
            if (visible) {
                if (onRequestClose) {
                    onRequestClose();
                } else {
                    onCancel();
                }
                return true;
            }
            return false;
        };

        BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [visible, onRequestClose, onCancel]);

    const assignMessage = () => {
        let mensaje = '';

        switch (numdId) {
            case 1:
                mensaje = '¿Está seguro que desea salir de la aplicación?';
                break;
            case 2:
                mensaje = `¿Está seguro que desea eliminar "${itemName}" del Historial de Reproducción?`;
                break;
            case 3:
                mensaje = '¡Ocurrió un error mientras se cargaba la aplicación!\nPor favor, recargue la app o intente de nuevo más tarde.\n\nSi persiste el error, consulte a su Proveedor de Servicios.';
                break;
            case 4:
                mensaje = '¡No está conectado a Internet!\nEs necesario que su dispositivo cuente con una conexión a Internet para que la app se pueda cargar.\n\nRevise su conexión y recargue la app o intente de nuevo más tarde.';
                break;
            default:
                mensaje = '';
        }

        return mensaje;
    };

    // Si el modal no está abierto, no renderiza nada
    if (!visible) return null;

    return (
        <View style={styles.modalOverlay} importantForAccessibility="yes">
            <View style={styles.centeredView}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Icon name="warning" size={Platform.isTV ? 29 : 27} color="#000" />
                        <Text style={styles.title}>AVISO</Text>
                    </View>
                    <Text style={styles.textMessage}>{assignMessage()}</Text>
                    <View style={styles.buttonsContainer}>
                        <View style={styles.buttonWrapper}>
                            <TouchableNativeFeedback
                                ref={confirmRef}
                                onPress={onConfirm}
                                background={focusRipple}
                                useForeground={!Platform.isTV}
                                nextFocusUp={focusTags.confirm}
                                nextFocusDown={focusTags.confirm}
                                nextFocusLeft={focusTags.confirm}
                                nextFocusRight={focusTags.cancel}
                            >
                                <View style={styles.borderSimulator}>
                                    <View style={[styles.innerContent, { backgroundColor: 'green' }]}>
                                        <Icon2 name={numdId >= 3 ? "reload" : "check"} size={24} color="#FFF" />
                                        <Text style={styles.textButton}>{`${numdId >= 3 ? 'Recargar' : 'Aceptar'}`}</Text>
                                    </View>
                                </View>
                            </TouchableNativeFeedback>
                        </View>
                        <View style={styles.buttonWrapper}>
                            <TouchableNativeFeedback
                                ref={cancelRef}
                                onPress={onCancel}
                                background={focusRipple}
                                useForeground={!Platform.isTV}
                                hasTVPreferredFocus={Platform.isTV}
                                nextFocusUp={focusTags.cancel}
                                nextFocusDown={focusTags.cancel}
                                nextFocusRight={focusTags.about ?? focusTags.cancel}
                                nextFocusLeft={focusTags.confirm}
                            >
                                <View style={styles.borderSimulator}>
                                    <View style={[styles.innerContent, { backgroundColor: 'red' }]}>
                                        {numdId >= 3 ? (
                                            <Icon name="exit-outline" size={24} color="#FFF" />
                                        ) : (
                                            <Icon2 name="cancel" size={24} color="#FFF" />
                                        )}
                                        <Text style={styles.textButton}>{`${numdId >= 3 ? 'Salir' : 'Cancelar'}`}</Text>
                                    </View>
                                </View>
                            </TouchableNativeFeedback>
                        </View>
                        {numdId >= 3 && (
                            <View style={styles.buttonWrapper}>
                                <TouchableNativeFeedback
                                    ref={aboutRef}
                                    onPress={() => navigation.navigate('About')}
                                    background={focusRipple}
                                    useForeground={!Platform.isTV}
                                    nextFocusUp={focusTags.about}
                                    nextFocusDown={focusTags.about}
                                    nextFocusRight={focusTags.about}
                                    nextFocusLeft={focusTags.cancel}
                                >
                                    <View style={styles.borderSimulator}>
                                        <View style={[styles.innerContent, { backgroundColor: 'blue' }]}>
                                            <Icon3 name="info-circle" size={24} color="#FFF" />
                                            <Text style={[styles.textButton, { marginLeft: 2.5 }]}>Sobre la App</Text>
                                        </View>
                                    </View>
                                </TouchableNativeFeedback>
                            </View>
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
        backgroundColor: '#FFF',
        borderRadius: 10,
        width: "55%",
        paddingBottom: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#333',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    title: {
        fontWeight: 'bold',
        fontSize: Platform.isTV ? 22 : 20,
        color: '#000',
        textAlignVertical: 'center',
        paddingLeft: 5
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 10,
    },
    buttonWrapper: {
        width: '30%',
        height: Platform.isTV ? 50 : 40,
        borderRadius: 5,
        overflow: 'hidden',
    },
    borderSimulator: {
        flex: 1,
        padding: Platform.isTV ? 5 : 0,
    },
    innerContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3,
    },
    textMessage: {
        color: '#000',
        fontSize: Platform.isTV ? 20 : 18,
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 10,
        marginHorizontal: 5,
        paddingHorizontal: 10
    },
    textButton: {
        fontSize: Platform.isTV ? 20 : 18,
        color: "#FFF",
        textAlign: 'center',
    },
});

export default ModalConfirmation;
