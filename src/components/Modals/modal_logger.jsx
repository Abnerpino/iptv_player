import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableNativeFeedback, StyleSheet, BackHandler, findNodeHandle, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Octicons';
import Icon2 from 'react-native-vector-icons/FontAwesome';
import Icon3 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon4 from 'react-native-vector-icons/MaterialIcons';
import Share from 'react-native-share';
import ErrorLogger from '../../services/logger/errorLogger';

const ModalLogger = ({ visible, onCancel }) => {
    const closeRef = useRef(null); // Referencia para el botón de Cerrar
    const sendRef = useRef(null); // Referencia para el botón de Enviar
    const [focusTags, setFocusTags] = useState({ close: null, send: null }); // Estado para manejar las etiquetas de los botones para el foco de atención
    const [exists, setExists] = useState(false); // Estado para saber si ya existe la bitácora de errores
    const [error, setError] = useState(false); // Estado para manejar cuando haya un error al compartir la bitácora

    const focusRipple = Platform.isTV ? TouchableNativeFeedback.Ripple('#000', false) : TouchableNativeFeedback.Ripple('#00000040', false);

    // useEffect para vincular los elementos para la navegación explicita
    useEffect(() => {
        // Si no es TV o si el modal no está abierto, no hace nada
        if (!Platform.isTV || !visible) return;

        // Timeout para asegurar que los elementos estén montados
        const timer = setTimeout(() => {
            if (closeRef.current) {
                const closeTag = findNodeHandle(closeRef.current); // Encuentra la etiqueta del botón Cerrar
                const sendTag = findNodeHandle(sendRef.current); // Encuentra la etiqueta del botón Enviar
                setFocusTags({ close: closeTag, send: sendTag }); // Asigna las etiquetas de los botones
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [visible]);

    // useEffect que determina si ya existe la bitácora al momento de montar el componente
    useEffect(() => {
        const logFileExists = async () => {
            try {
                const fileExists = await ErrorLogger.checkFile();

                if (fileExists) {
                    setExists(true);
                }
            } catch (error) {
                ErrorLogger.log('ModalLogger - logFileExists', error);
            }
        };

        logFileExists();
    }, []);

    // useEffect para el manejo del botón físico "Atrás" de Android
    useEffect(() => {
        const onBackPress = () => {
            if (visible) {
                onCancel();
                return true;
            }
            return false;
        };

        BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [visible, onCancel]);

    // Función para compartir la bitácora de errores
    const sendErrorLog = async () => {
        setError(false); // Oculta cualquier error que se esté mostrando

        try {
            // Obtiene la ruta segura en caché
            const cachePath = await ErrorLogger.prepareForShare();

            if (!cachePath) {
                setError(true);
                ErrorLogger.log('ModalLogger - sendErrorLog', 'No se pudo generar el archivo para compartir.');
                return;
            }

            const fileUrl = 'file://' + cachePath;

            const shareOptions = {
                title: 'Enviar Bitácora de Errores',
                subject: 'Reporte de Errores IPTV Player',
                message: 'Adjunto bitácora de errores.',
                url: fileUrl,
                type: 'text/plain',
                failOnCancel: false,
            };

            await Share.open(shareOptions);
        } catch (error) {
            setError(true);
            ErrorLogger.log('ModalLogger - sendErrorLog', error);
        }
    };

    // Si el modal no está abierto, no renderiza nada
    if (!visible) return null;

    return (
        <View style={styles.modalOverlay} importantForAccessibility="yes">
            <View style={styles.centeredView}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <View style={{ flexDirection: 'row' }}>
                            <Icon name="log" size={27} color="#333" />
                            <Text style={styles.title}>BITÁCORA DE ERRORES</Text>
                        </View>
                        <View style={styles.closeWrapper}>
                            <TouchableNativeFeedback
                                ref={closeRef}
                                onPress={onCancel}
                                background={focusRipple}
                                useForeground={!Platform.isTV}
                                hasTVPreferredFocus={Platform.isTV}
                                nextFocusDown={focusTags.send}
                                nextFocusUp={focusTags.close}
                                nextFocusLeft={focusTags.close}
                                nextFocusRight={focusTags.close}
                            >
                                <View style={styles.borderSimulator}>
                                    <View style={{ borderRadius: 3 }}>
                                        <Icon2 name="window-close" size={27} color="red" />
                                    </View>
                                </View>
                            </TouchableNativeFeedback>
                        </View>
                    </View>
                    <View style={styles.body}>
                        <Text style={styles.textMessage}>La "Bitácora de Errores" es un registro detallado y cronológico de los fallos en la aplicación. Si ya existe una, se listará a continuación:</Text>
                        <View style={[styles.bitacoraContainer, { marginBottom: exists ? 10 : 0 }]}>
                            {exists ? (
                                <Text style={styles.textBitacora}>bitacora_errores.txt</Text>
                            ) : (
                                <Text style={styles.textAviso}>Aún no existe la bitácora</Text>
                            )}
                        </View>
                        {exists && (
                            <>
                                <Text style={styles.textMessage}>Si su aplicación está fallando, envíe (preferentemente por WhatsApp) la bitácora a su Proveedor de Servicios.</Text>
                                <View style={styles.buttonWrapper}>
                                    <TouchableNativeFeedback
                                        ref={sendRef}
                                        onPress={sendErrorLog}
                                        background={focusRipple}
                                        useForeground={!Platform.isTV}
                                        nextFocusDown={focusTags.send}
                                        nextFocusUp={focusTags.close}
                                        nextFocusLeft={focusTags.send}
                                        nextFocusRight={focusTags.send}
                                    >
                                        <View style={[styles.borderSimulator, { padding: Platform.isTV ? 5 : 0 }]}>
                                            <View style={styles.button}>
                                                <Text style={styles.textButton}>Enviar</Text>
                                                <Icon3 name="send" size={24} color="#FFF" />
                                            </View>
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                                {error && (
                                    <View style={styles.errorContainer}>
                                        <Icon4 name="report-gmailerrorred" size={18} color="red" />
                                        <Text style={styles.textError}>¡Ocurrió un error! Intente de nuevo más tarde</Text>
                                    </View>
                                )}
                            </>
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
        width: "50%",
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 2,
        borderBottomColor: '#333',
        paddingVertical: 5,
        paddingHorizontal: 20,
    },
    body: {
        paddingTop: 10,
        paddingBottom: 15,
        paddingHorizontal: 15
    },
    title: {
        fontWeight: 'bold',
        fontSize: 20,
        color: '#333',
        textAlignVertical: 'center',
        paddingLeft: 5
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
    buttonWrapper: {
        height: Platform.isTV ? 46 : 36,
        width: '22.5%',
        marginTop: 15,
        alignSelf: 'center',
        borderRadius: 8,
        overflow: 'hidden',
    },
    button: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        borderRadius: 5,
        padding: 5,
        backgroundColor: 'green'
    },
    textMessage: {
        color: '#000',
        fontSize: 18,
        fontWeight: '500',
        textAlign: 'justify',
    },
    bitacoraContainer: {
        alignItems: 'center',
        marginTop: 15,
    },
    textBitacora: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFF',
        paddingBottom: 2,
        paddingHorizontal: 8,
        borderRadius: 5,
        backgroundColor: 'blue'
    },
    textAviso: {
        fontSize: 16,
        fontStyle: 'italic',
        color: 'black'
    },
    textButton: {
        fontSize: 18,
        color: "#FFF",
        textAlign: 'center',
    },
    errorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5
    },
    textError: {
        fontSize: 16,
        color: 'red',
    }
});

export default ModalLogger;