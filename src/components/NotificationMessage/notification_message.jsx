import { View, Text, StyleSheet } from 'react-native';

const NotificationMessage = ({ mensaje }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{mensaje}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: '30%',
        alignItems: 'center',
    },
    text: {
        color: '#000',
        fontSize: 16,
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: '#EEE'
    }
});

export default NotificationMessage;