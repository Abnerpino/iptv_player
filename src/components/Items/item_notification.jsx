import React, { useEffect, useState, useRef } from "react";
import { TouchableNativeFeedback, Text, StyleSheet, View, findNodeHandle, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ItemNotification = ({ notificacion, index, seleccionar, expiracion, closeButtonTag, total, getFirstItem, flag }) => {
    const notifRef = useRef(null); // Referencia del item de Notificación
    const [notifTag, setNotifTag] = useState(null); // Estado para menajar la etiqueta del item de Notificación

    const focusRipple = Platform.isTV ? TouchableNativeFeedback.Ripple('#000', false) : TouchableNativeFeedback.Ripple('#00000040', false);

    // Reemplaza '{fecha_expiracion}' por la fecha de expiración del paquete contratado y agrega saltos de linea cuando encuentra '{salto_linea}' en el mensaje
    const mensaje = notificacion.message.replace("{fecha_expiracion}", expiracion).replace(/{salto_linea}/g, "\n");

    // Formatea la fecha para mostrarla de acuerdo a la configuración regional (es-MX), omitiendo los segundos
    const fecha = notificacion.fecha.toLocaleString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    // useEffect para vincular el item de Notificación para navegación explicita
    useEffect(() => {
        // Si no es TV, no hace nada
        if (!Platform.isTV) return;

        // Timeout para asegurar que el item de Notificación esté montado
        const timer = setTimeout(() => {
            if (notifRef.current) {
                const tag = findNodeHandle(notifRef.current); // Busca la etiqueta del item de Notificación
                setNotifTag(tag); // Actualiza el estado de la etiqueta de Notificación
                // Si es el primer elemento...
                if (index === 0) {
                    getFirstItem('notif', tag); // Registra la etiqueta en el padre
                }
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    // Función para la lógica de Navegación
    const getTarget = (direction) => {
        // ABAJO
        if (direction === 'down') {
            // Si no es el último elemento, permite la navegación por defecto
            if (index < (total - 1)) return undefined;

            // Si es el último elemento, bloquea la navegación hacía abajo
            return notifTag;
        }

        // ARRIBA
        if (direction === 'up') {
            // Si es el primer elemento, sube al botón de cerrar
            if (index === 0) return closeButtonTag;

            // Si no es el primer elemento, permite la navegación por defecto
            return undefined;
        }

        // IZQUIERDA
        if (direction === 'left') {
            return notifTag; // Bloquea la navegación hacía la izquierda
        }

        // DERECHA
        if (direction === 'right') {
            return notifTag; // Bloquea la navegación hacía la derecha
        }
    };

    // Método para seleccionar notificaciones
    const handleSelectNotification = () => {
        // Si la notificación no ha sido vista...
        if (!notificacion.visto) {
            seleccionar(notificacion.id); // Manda el id de la notifiación
        }
    };

    return (
        <View style={[styles.notificactionWrapper, { marginBottom: flag ? 0 : Platform.isTV ? 7.5 : 12.5 }]}>
            <TouchableNativeFeedback
                ref={notifRef}
                onPress={handleSelectNotification}
                background={focusRipple}
                useForeground={!Platform.isTV}
                nextFocusUp={getTarget('up')}
                nextFocusDown={getTarget('down')}
                nextFocusLeft={getTarget('left')}
                nextFocusRight={getTarget('right')}
            >
                <View style={styles.borderSimulator}>
                    <View style={[styles.innerContent, { backgroundColor: notificacion.visto ? '#383838' : '#0A6522' }]}>
                        <Text style={[styles.textMessage, { fontSize: notificacion.visto ? 14 : 16 }]}>{mensaje}</Text>
                        <View style={styles.dateContainer}>
                            <Icon name='calendar-clock' size={12.5} color='#FFF' />
                            <Text style={styles.textDate}>{fecha}</Text>
                        </View>
                    </View>
                </View>
            </TouchableNativeFeedback>
        </View>
    );
}

const styles = StyleSheet.create({
    notificactionWrapper: {
        borderRadius: 8,
        overflow: 'hidden'
    },
    borderSimulator: {
        flex: 1,
        padding: Platform.isTV ? 5 : 0,
    },
    innerContent: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5
    },
    textMessage: {
        fontSize: Platform.isTV ? 16 : 14,
        color: "#FFF",
        textAlign: 'justify',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 5,
    },
    textDate: {
        color: '#FFF',
        fontSize: Platform.isTV ? 12 : 10,
        fontStyle: 'italic',
        marginLeft: 2.5
    }
});

export default ItemNotification;