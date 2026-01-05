import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, BackHandler } from 'react-native';
import Icon from 'react-native-vector-icons/Octicons';
import Icon2 from 'react-native-vector-icons/FontAwesome';
import Icon3 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon4 from 'react-native-vector-icons/MaterialIcons';
import Share from 'react-native-share';
import ErrorLogger from '../../services/logger/errorLogger';

const ModalLogger = ({ visible, onCancel }) => {
    const [exists, setExists] = useState(false); // Estado para saber si ya existe la bitácora de errores
    const [error, setError] = useState(false); // Estado para manejar cuando haya un error al compartir la bitácora

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
        <View style={[styles.modalOverlay, StyleSheet.absoluteFill]}>
            <View style={styles.touchableBackground}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <View style={{ flexDirection: 'row' }}>
                            <Icon name="log" size={27} color="#333" />
                            <Text style={styles.title}>BITÁCORA DE ERRORES</Text>
                        </View>
                        <TouchableOpacity onPress={onCancel}>
                            <Icon2 name="window-close" size={27} color="red" />
                        </TouchableOpacity>
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
                                <TouchableOpacity onPress={sendErrorLog} style={styles.button}>
                                    <Text style={styles.textButton}>Enviar</Text>
                                    <Icon3 name="send" size={24} color="#FFF" />
                                </TouchableOpacity>
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
    button: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignSelf: 'center',
        borderRadius: 5,
        padding: 5,
        marginTop: 15,
        width: '20%',
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