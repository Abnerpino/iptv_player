import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableNativeFeedback, findNodeHandle, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const SearchBar = ({ message, searchText, setSearchText, playerTag, getBarTag, flag }) => {
    const barRef = useRef(null); // Referencia para todo el componente
    const inputRef = useRef(null); // Referencia para controlar el Input
    const clearRef = useRef(null); // Referencia para el icono de Limpiar
    const [focusTags, setFocusTags] = useState({ down: null, right: null }); // Estado para manejar las etiquetas de navegación
    const [forceBarFocus, setForceBarFocus] = useState(false); // Estado para forzar el foco de forma reactiva

    const focusRipple = Platform.isTV ? TouchableNativeFeedback.Ripple('#FFD700', false) : TouchableNativeFeedback.Ripple('#00000040', false);

    // useEffect para vincular los elementos para navegación explicita
    useEffect(() => {
        // Si no es TV, no hace nada
        if (!Platform.isTV) return;

        let downTag, rightTag = null;

        if (playerTag) {
            downTag = playerTag;
        }
        if (barRef.current) {
            rightTag = flag ? findNodeHandle(barRef.current) : undefined;
        }
        if (getBarTag) {
            getBarTag('bar', findNodeHandle(barRef.current));
        }
        if (clearRef.current) {
            rightTag = findNodeHandle(clearRef.current);
        }

        setFocusTags({ down: downTag, right: rightTag });
    }, [playerTag, barRef, clearRef, searchText]);

    // useEffect "Resorte" para el foco
    useEffect(() => {
        // Si no es TV o si el disparador está desactivado, no hace nada
        if (!Platform.isTV || !forceBarFocus) return;

        const timer = setTimeout(() => {
            setForceBarFocus(false); // Desactiva el disparador para no dejar el foco "secuestrado"
        }, 100);
        return () => clearTimeout(timer);
    }, [forceBarFocus]);

    const handleSubmitEditing = () => {
        // Si no es TV, no hace nada
        if (!Platform.isTV) return;

        // Al presionar Enter/Done en el teclado, activa el disparador de foco (la TV enfoca la barra)
        setForceBarFocus(true);
    };

    return (
        <View style={styles.wrapper}>
            <View style={styles.rowContainer}>
                {/* Área del Input (Elemento navegable principal) */}
                <View style={styles.inputFlexContainer}>
                    <TouchableNativeFeedback
                        ref={barRef}
                        onPress={() => inputRef.current?.focus()}
                        background={focusRipple}
                        useForeground={!Platform.isTV}
                        nextFocusDown={focusTags.down}
                        nextFocusRight={focusTags.right}
                        hasTVPreferredFocus={forceBarFocus}
                    >
                        {/* Contenedor interno para el Icono de Lupa y el TextInput */}
                        <View style={styles.inputTouchableContent}>
                            <View style={styles.searchIconContainer}>
                                <Icon name="search" size={Platform.isTV ? 20 : 18} color="#888" />
                            </View>
                            <TextInput
                                ref={inputRef}
                                style={styles.input}
                                placeholder={message}
                                placeholderTextColor="#888"
                                value={searchText}
                                disableFullscreenUI={true}
                                onChangeText={setSearchText}
                                onSubmitEditing={handleSubmitEditing}
                            />
                        </View>
                    </TouchableNativeFeedback>
                </View>

                {/* Botón de Borrar (Elemento navegable independiente) */}
                {searchText.length > 0 && (
                    <View style={styles.clearButtonWrapper}>
                        <TouchableNativeFeedback
                            ref={clearRef}
                            onPress={() => {
                                setSearchText('');
                                inputRef.current?.focus();
                            }}
                            background={TouchableNativeFeedback.Ripple('#FFD700', true)}
                            useForeground={true}
                            nextFocusDown={focusTags.down}
                        >
                            <View style={styles.clearIconView}>
                                <Icon name="times" size={Platform.isTV ? 20 : 18} color="#888" />
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        marginVertical: 5,
        borderColor: '#FFF',
        borderWidth: Platform.isTV ? 0.25 : 0.1,
        height: 40,
        justifyContent: 'center',
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: '100%',
    },
    // Estilos Input
    inputFlexContainer: {
        flex: 1,
        height: '100%',
    },
    inputTouchableContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        color: 'white',
        fontSize: Platform.isTV ? 18 : 16,
        paddingVertical: 0,
        includeFontPadding: false,
    },
    // Estilos Lupa
    searchIconContainer: {
        paddingLeft: 15,
        paddingRight: 10,
        justifyContent: 'center',
        height: '100%',
    },
    // Estilos Botón Borrar
    clearButtonWrapper: {
        height: 30,
        width: 30,
        marginRight: 5,
        borderRadius: 20,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearIconView: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default SearchBar;
