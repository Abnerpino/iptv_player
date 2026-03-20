import React, { useCallback, useState, useRef } from "react";
import { Text, TouchableNativeFeedback, View, StyleSheet, findNodeHandle, Platform } from "react-native";

const ItemSeason = ({ item, index, selected, totalItems, onPress, closeButtonTag, registry, onRegister }) => {
    const seasonRef = useRef(null); // Referencia del item temporada
    const [seasonTag, setSeasonTag] = useState(null); // Estado para menajar la etiqueta del item temporada

    const focusRipple = Platform.isTV ? TouchableNativeFeedback.Ripple('#000', false) : TouchableNativeFeedback.Ripple('#00000040', false);

    const numColumns = 4;
    const row = Math.floor(index / numColumns);
    const totalRows = Math.ceil(totalItems / numColumns);
    const isFirstRow = row === 0;
    const isLastRow = row === totalRows - 1;

    // Callback de Registro
    const setRef = useCallback((node) => {
        // Si no es TV o no existe el nodo, no hace nada
        if (!Platform.isTV || !node) return;

        seasonRef.current = node; // Asigna el nodo a la referencia del item de temporada
        const tag = findNodeHandle(node); // Busca la etiqueta del nodo
        setSeasonTag(tag); // Actualiza el estado de la etiqueta de temporada
        onRegister(index, tag); // Registra la etiqueta en el padre
    }, [index, onRegister]);

    // Función para la lógica de Navegación
    const getTarget = (direction) => {
        // Si no existe la etiqueta del item temporada o el registro del padre está vacío, bloquea la navegación
        if (!seasonTag || !registry) return seasonTag;

        // ABAJO
        if (direction === 'down') {
            const targetIndex = index + numColumns; // Indice del elemento que está abajo

            // Si existe el elemento de abajo, baja ahí
            if (registry[targetIndex]) return registry[targetIndex];

            // Si es un "hueco" (no existe abajo pero no es última fila)...
            if (!isLastRow && !registry[targetIndex]) {
                return registry[totalItems - 1] || seasonTag; // Baja al último de la lista o si no está disponible, bloquea la navegación hacía abajo
            }

            // Si es última fila, bloquea la navegación hacía abajo
            return seasonTag;
        }

        // ARRIBA
        if (direction === 'up') {
            // Si es primera fila, sube al botón de cerrar o si no está disponible, bloquea la navegación hacía arriba
            if (isFirstRow) return closeButtonTag || seasonTag;
            return registry[index - numColumns] || seasonTag; // Si no es primera fila, sube al elemento de arriba o si no está disponible, bloquea la navegación hacía arriba
        }

        // IZQUIERDA (Snake Logic)
        if (direction === 'left') {
            if (index === 0) return seasonTag; // Bloquea la navegación hacía la izquierda si es el primer elemento
            return registry[index - 1] || seasonTag; // Si no es el primer elemento, va al anterior o si no está disponible, bloquea la navegación hacía la izquierda
        }

        // DERECHA (Snake Logic)
        if (direction === 'right') {
            if (index === totalItems - 1) return seasonTag; // Bloquea la navegación hacía la derecha si es el último elemento
            return registry[index + 1] || seasonTag; // Si no es el último elemento, va al siguiente o si no está disponible, bloquea la navegación hacía la derecha
        }
    };

    return (
        <View style={styles.seasonWrapper}>
            <TouchableNativeFeedback
                ref={setRef}
                onPress={() => onPress(item)}
                background={focusRipple}
                useForeground={!Platform.isTV}
                nextFocusUp={getTarget('up')}
                nextFocusDown={getTarget('down')}
                nextFocusLeft={getTarget('left')}
                nextFocusRight={getTarget('right')}
            >
                <View style={styles.borderSimulator}>
                    <View style={[styles.innerContent, { backgroundColor: selected ? '#006172' : '#007BFF' }]}>
                        <Text style={styles.textSeason}>{`Temporada ${item.numero}`}</Text>
                        <Text style={styles.textEpisode}>{`${item.episodios} Episodios`}</Text>
                    </View>
                </View>
            </TouchableNativeFeedback>
        </View>
    );
};

const styles = StyleSheet.create({
    seasonWrapper: {
        width: '23%',
        margin: '1%',
        borderRadius: 8,
        overflow: 'hidden',
    },
    borderSimulator: {
        flex: 1,
        padding: Platform.isTV ? 3 : 0,
        margin: Platform.isTV ? 0 : -3
    },
    innerContent: {
        flex: 1,
        borderRadius: 5,
        padding: 7.5,
        margin: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textSeason: {
        fontSize: Platform.isTV ? 18 : 16,
        color: '#FFF',
        fontWeight: 'bold',
    },
    textEpisode: {
        fontSize: Platform.isTV ? 16 : 14,
        color: '#FFF'
    }
});

export default ItemSeason;