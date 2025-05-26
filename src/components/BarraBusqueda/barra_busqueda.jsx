import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const BarraBusqueda = ({ message, searchText, setSearchText }) => {
    return (
        <View style={styles.searchContainer}>
            <Icon name="search" size={18} color="#888" style={styles.searchIcon} />
            <TextInput
                style={styles.input}
                placeholder={message}
                placeholderTextColor="#888"
                value={searchText}
                disableFullscreenUI={true}
                onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                    <Icon name="times" size={18} color="#888" style={styles.clearIcon} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(28,28,28,0)',
        borderRadius: 10,
        borderColor: '#FFF',
        borderWidth: 0.1,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginVertical: 5,
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        paddingVertical: 2,
    },
    clearIcon: {
        marginLeft: 8,
    },
});

export default BarraBusqueda;
