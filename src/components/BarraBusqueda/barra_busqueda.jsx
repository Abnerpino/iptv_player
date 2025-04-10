import { View, StyleSheet, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const BarraBusqueda = ({ message, searchText, setSearchText }) => {

    return (
        <View style={styles.searchContainer}>
            <Icon name="search" size={18} color="#888" style={{ marginRight: 8 }} />
            <TextInput
                style={styles.input}
                placeholder={message}
                placeholderTextColor="#888"
                value={searchText}
                onChangeText={setSearchText}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1c1c1c',
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    input: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        paddingVertical: 8,
    },
});

export default BarraBusqueda;