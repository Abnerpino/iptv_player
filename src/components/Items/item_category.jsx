import { View, Text, TouchableHighlight, TouchableNativeFeedback, StyleSheet, Platform } from "react-native";

const ItemCategory = ({ categoria, seleccionado, seleccionar, isOnReproductor }) => {
    const backgroundColor = categoria.category_id === seleccionado ? '#006172' : 'rgba(16,16,16,0)'; // Cambia el color según la selección
    const borderBottomColor = isOnReproductor ? '#999' : '#303030'; // Establece el color dependiendo de si el item se muestra dentro o fuera del reproductor
    const focusRipple = categoria.category_id !== seleccionado ? TouchableNativeFeedback.Ripple('#FFD700', false) : undefined;

    const handleSelectionCategory = () => {
        seleccionar(categoria);
    };

    return (
        <>
            {Platform.isTV ? (
                // Diseño para TV
                <View style={[styles.wrapper, { backgroundColor, borderBottomColor }]}>
                    <TouchableNativeFeedback
                        onPress={handleSelectionCategory}
                        background={focusRipple}
                        useForeground={false}
                        hasTVPreferredFocus={categoria.category_id === seleccionado}
                    >
                        <View style={[
                            styles.content,
                            { padding: 10 },
                            categoria.category_id === seleccionado && { backgroundColor: '#006172' }
                        ]}>
                            <Text style={[styles.text, { width: '75%' }]} numberOfLines={1}>{categoria.category_name}</Text>
                            <Text style={[styles.text, { width: '25%', textAlign: 'right' }]}>{categoria.total}</Text>
                        </View>
                    </TouchableNativeFeedback>
                </View>
            ) : (
                // Diseño para Móvil
                <TouchableHighlight
                    style={[styles.wrapper, { padding: 10, backgroundColor, borderBottomColor }]}
                    onPress={handleSelectionCategory}
                    underlayColor={(categoria.category_id !== seleccionado) ? "#D5700F" : "#006172"}
                >
                    <View style={styles.content}>
                        <Text style={[styles.text, { width: '75%' }]} numberOfLines={1}>{categoria.category_name}</Text>
                        <Text style={[styles.text, { width: '25%', textAlign: 'right' }]}>{categoria.total}</Text>
                    </View>
                </TouchableHighlight>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        height: 40,
        borderBottomWidth: 1,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    text: {
        color: 'white',
        fontSize: 14,
    }
});

export default ItemCategory;