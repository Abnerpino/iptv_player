import React, { useState } from 'react';
import { View, Text, ScrollView, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import StarRating from '../../components/StarRating';
import CardActor from '../../components/Cards/card_actor';
import Icon from 'react-native-vector-icons/FontAwesome';

const Pelicula = ({ navigation, route }) => {
    const [favorite, setFavorite] = useState(false);

    const title = route.params.titulo;
    const poster = route.params.imagen;
    const details = route.params.info[0];
    const credits = route.params.info[1];
    const link = route.params.link;

    const getDate = (date) => {
        const fecha = new Date(date);
        const day = fecha.getDate().toString().padStart(2, '0');
        const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const year = fecha.getFullYear();
        const newDate = date ? `${day}/${month}/${year}` : 'N/A';
        return newDate;
    };

    const convertDuration = (minutes) => {
        if (minutes) {
            const hours = Math.floor(minutes / 60); // Obtener las horas
            const minutesRemaining = minutes % 60; // Obtener los minutos restantes
            return `${hours}h ${minutesRemaining}m`; // Formato de salida
        } else {
            return 'N/A';
        }
    };

    const ItemSeparator = () => (
        <View style={{ width: 10 }} /> // Espacio entre elementos
    );

    return (
        <View style={styles.container}>
            {/* Vista principal en columna */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 10
            }}>
                {/* Fila con textos */}
                <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold' }}>{title}</Text>
            </View>

            {/* ScrollView para contenido desplazable */}
            <ScrollView>
                {/* Vista en fila dentro del ScrollView */}
                <View style={styles.row}>
                    <Image
                        source={{ uri: poster }} // URL de la imagen
                        style={{ width: '15.5%', height: '100%', borderRadius: 5, borderColor: '#fff', borderWidth: 0.5 }}
                        resizeMode='contain'
                    />
                    <View style={{ flexDirection: 'row', paddingLeft: 35, paddingVertical: 7.5, width: '100%', }}>
                        <View style={styles.column}>
                            <Text style={[styles.text, { fontWeight: 'bold' }]}>Título original:</Text>
                            <Text style={[styles.text, { fontWeight: 'bold' }]}>Lanzamiento:</Text>
                            <Text style={[styles.text, { fontWeight: 'bold' }]}>Duración:</Text>
                            <Text style={[styles.text, { fontWeight: 'bold' }]}>Género:</Text>
                            <Text style={[styles.text, { fontWeight: 'bold' }]}>Calificación:</Text>
                        </View>
                        <View style={{ flexDirection: "column", alignItems: "flex-start", marginLeft: 75 }}>
                            <Text style={styles.text}>{details.original_title ? details.original_title : 'N/A'}</Text>
                            <Text style={styles.text}>{getDate(`${details.release_date}T06:00:00.000Z`)}</Text>
                            <Text style={[styles.text, { backgroundColor: '#262637', paddingHorizontal: 10, borderRadius: 5 }]}>{convertDuration(details.runtime)}</Text>
                            <Text style={styles.text}>{details.genres ? details.genres.join(' / ') : 'N/A'}</Text>
                            <StarRating rating={details.vote_average ? details.vote_average : 0}/>
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: 10 }}>
                    <TouchableOpacity onPress={() => navigation.navigate('Reproductor', { link })} style={styles.button}>
                        <Text style={styles.textButton}>Play</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setFavorite(!favorite)} style={[styles.button, { flexDirection: 'row', justifyContent: 'center', marginLeft: 20 }]}>
                        <Icon name={!favorite ? "heart-o" : "heart"} size={22} color={!favorite ? "black" : "red"}/>
                        <Text style={[styles.textButton, { paddingLeft: 5 }]}>Favoritos</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ paddingVertical: 10 }}>
                    <Text style={{ fontSize: 16, textAlign: 'justify', color: '#CCC', }}>{details.overview ? details.overview : 'N/A'}</Text>
                </View>
                {/* Vista en columna con texto y FlatList */}
                <View style={{ paddingHorizontal: 5, paddingBottom: 5 }}>
                    <FlatList
                        data={credits[0]}
                        horizontal
                        renderItem={({ item }) => (
                            <CardActor
                                imagen={item.imagen}
                                nombre={item.nombre}
                            />
                        )}
                        keyExtractor={(item) => item.id}
                        ItemSeparatorComponent={ItemSeparator}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

// Estilos para la aplicación
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 25,
        backgroundColor: '#101010',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    column: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    text: {
        fontSize: 16,
        color: '#CCC',
        marginVertical: 6.5,
    },
    button: {
        width: '15%',
        borderRadius: 5,
        padding: 5,
        backgroundColor: 'rgb(80,80,100)',
    },
    textButton: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center'
    },
});

export default Pelicula;