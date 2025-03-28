import React from 'react';
import { View, Text, ScrollView, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import CardActor from '../../components/Cards/card_actor';
import StarRating from '../../components/StarRating';

const Serie = ({ navigation, route }) => {
    const title = route.params.titulo;
    const poster = route.params.imagen;
    const details = route.params.info;
    const link = route.params.link;
    //const credits = route.params.info[1];

    const getDirector = (dir) => {
        const director = dir ? dir : 'N/A';
        return director;
    };

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

    const getGenres = (genres) => {
        const genero = genres ? genres.map(genre => genre.name).join('/') : 'N/A';
        return genero;
    };

    const getCalification = (calification) => {
        const calificacion = calification ? calification : 'N/A';
        return calificacion;
    };

    const getDescription = (description) => {
        const descripcion = description ? description : 'N/A';
        return descripcion;
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
                        source={{ uri: `https://image.tmdb.org/t/p/original${details.poster_path}` }} // URL de la imagen
                        style={{ width: '15.5%', height: '100%', borderRadius: 5, borderColor: '#fff', borderWidth: 0.5 }}
                        resizeMode='contain'
                    />
                    <View style={{ flexDirection: 'row', paddingLeft: 35, paddingVertical: 7.5, width: '100%', }}>
                        <View style={styles.column}>
                            <Text style={[styles.text, { fontWeight: 'bold' }]}>Lanzamiento:</Text>
                            <Text style={[styles.text, { fontWeight: 'bold' }]}>Género:</Text>
                            <Text style={[styles.text, { fontWeight: 'bold' }]}>Calificación:</Text>
                            <Text style={[styles.text, { fontWeight: 'bold' }]}>Trama:</Text>
                            
                        </View>
                        <View style={{ flexDirection: "column", alignItems: "flex-start", marginLeft: 75, paddingRight: '28%', }}>
                            <Text style={styles.text}>{getDate(`${details.first_air_date}T06:00:00.000Z`)}</Text>
                            {/*<Text style={[styles.text, { backgroundColor: '#262637', paddingHorizontal: 10, borderRadius: 5 }]}>En el exilio</Text>*/}
                            <Text style={styles.text}>{getGenres(details.genres)}</Text>
                            <StarRating rating={getCalification(details.vote_average)}/>
                            <Text style={{ fontSize: 16, textAlign: 'justify', color: '#CCC', paddingRight: 0, }} numberOfLines={2} >{getDescription(details.overview)}</Text>
                            <Text style={{ color: 'rgb(255,127,0)', fontSize: 14, fontWeight: 'bold'}}>Leer Más</Text>
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', }}>
                    <TouchableOpacity onPress={() => navigation.navigate('Reproductor', { link })} style={{
                        width: '15%',
                        alignSelf: 'center',
                        borderRadius: 5,
                        padding: 5,
                        backgroundColor: 'rgb(80,80,100)',
                        marginRight: 20
                    }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: '#FFF',
                            textAlign: 'center'
                        }}>Play</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        width: '15%',
                        alignSelf: 'center',
                        borderRadius: 5,
                        padding: 5,
                        backgroundColor: 'rgb(80,80,100)'
                    }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: '#FFF',
                            textAlign: 'center'
                        }}>Temporada</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ paddingVertical: 10 }}>
                    <Text ></Text>
                </View>
                {/* Vista en columna con texto y FlatList */}
                <View style={{ paddingHorizontal: 5, paddingBottom: 5 }}>
                    {/*<FlatList
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
                    />*/}
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
        marginVertical: 7.5,
    },
});

export default Serie;