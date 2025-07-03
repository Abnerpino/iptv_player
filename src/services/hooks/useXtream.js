import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCatsLive, setCatsVod, setCatsSeries, setLive, setVod, setSeries, changeCategoryProperties } from '../redux/slices/streamingSlice';
import { getRealm } from '../realm/index';
import { saveItems, getItems } from '../realm/streaming';

export const useXtream = () => {
    const dispatch = useDispatch();
    const realm = getRealm();
    const { user, password, host } = useSelector(state => state.client);
    //const { live, vod, series } = useSelector(state => state.streaming);
    const url = `${host}/player_api.php?username=${user}&password=${password}`;

    const getInfoAccount = async () => {
        try {
            const response = await fetch(url);
            const info = await response.json();
            console.log(info.user_info.status);
        } catch (error) {
            console.log('Error en la petición: ', error);
        }
    };

    const getFullStreaming = async () => {
        console.log('getFullStreaming');
        /*AsyncStorage.clear().then(() => {
            console.log('✅ AsyncStorage limpiado con éxito');
        });*/

        const tipos = ['live', 'vod', 'series'];
        const initialCats = [
            { category_id: '0.1', category_name: 'TODO', total: 0 },
            { category_id: '0.2', category_name: 'RECIENTEMENTE VISTO', total: 0 },
            { category_id: '0.3', category_name: 'FAVORITOS', total: 0 }
        ];

        for (const tipo of tipos) {
            console.log(tipo);
            let contenido = [];
            const categories = await getCategoriesByType(tipo); // Obtiene las categorías para el tipo actual
            const categorias = [...initialCats, ...categories]; // Combina las categorías iniciales con las nuevas

            // Procesa cada categoría de forma secuencial y espera los resultados
            switch (tipo) {
                case 'live':
                    const canales = await getLiveStream();
                    contenido = canales;
                    dispatch(setCatsLive(categorias)); //Guarda las categorias de LIVE en el almacenamiento global
                    //dispatch(setLive(canales)); //Guarda el id del stream, visto y favorito de LIVE en el almacenamiento global
                    saveItems('live', canales);
                    console.log('LIVE actualizado');
                    break;
                case 'vod':
                    const peliculas = await getVodStream();
                    contenido = peliculas;
                    dispatch(setCatsVod(categorias)); //Guarda las categorias de VOD en el almacenamiento global
                    //dispatch(setVod(peliculas)); //Guarda el id del stream, el id de tmdb, visto y favorito de VOD en el almacenamiento global
                    saveItems('vod', peliculas);
                    console.log('VOD actualizado');
                    break;
                case 'series':
                    const series = await getSeries();
                    contenido = series;
                    dispatch(setCatsSeries(categorias)); //Guarda las categorias de SERIES en el almacenamiento global
                    //dispatch(setSeries(newSeries)); //Guarda el id del stream, el id de tmdb, visto y favorito de SERIES en el almacenamiento global
                    saveItems('series', series);
                    console.log('SERIES actualizado');
                    break;
            }

            categorias.forEach(categoria => {
                switch (categoria.category_id) {
                    case '0.1':
                        dispatch(changeCategoryProperties({
                            type: tipo,
                            categoryId: '0.1',
                            changes: { total: contenido.length }
                        }));
                        break;
                    case '0.2':
                        break;
                    case '0.3':
                        break;
                    default:
                        const filtradro = contenido.filter(content => content.category_id === categoria.category_id);
                        dispatch(changeCategoryProperties({
                            type: tipo,
                            categoryId: categoria.category_id,
                            changes: { total: filtradro.length }
                        }));
                        break;
                }
            });
        }
        console.log('FIN');
    };

    const getInfoStreamingByType = async (type) => {

    };

    const getCategoriesByType = async (type) => {
        const newLink = `${url}&action=get_${type}_categories`;

        try {
            const response = await fetch(newLink);
            const categories = await response.json();

            const categorias = categories.map(({ category_id, category_name }) => ({
                category_id,
                category_name,
                total: 0
            }));
            return categorias;
        } catch (error) {
            console.log('Error al obtener las categorias: ', error);
        }
    };

    const getLiveStream = async () => {
        const newLive = [];
        const newLink = `${url}&action=get_live_streams`;
        const live = getItems('live');

        try {
            const response = await fetch(newLink);
            const stream = await response.json();

            stream.forEach(({ num, name, stream_id, stream_icon, category_id, category_ids }) => {
                const canal = live?.find(channel => channel.stream_id === stream_id);

                newLive.push({
                    num,
                    name,
                    stream_id,
                    stream_icon,
                    category_id,
                    category_ids,
                    link: `${host}/live/${user}/${password}/${stream_id}.ts`,
                    favorito: canal?.favorito ?? false,
                    visto: canal?.visto ?? false,
                });
            });

            return newLive;
        } catch (error) {
            console.log(`Error al obtener el contenido de LIVE: ${error}`);
        }
    };

    const getVodStream = async () => {
        const newVod = [];
        const newLink = `${url}&action=get_vod_streams`;
        const vod = getItems('vod');

        try {
            const response = await fetch(newLink);
            const stream = await response.json();
            stream.forEach(({ num, name, title, year, stream_id, stream_icon, rating, plot, genre, category_id, category_ids, release_date, episode_run_time, container_extension }) => {
                const pelicula = vod?.find(movie => movie.stream_id === stream_id);

                newVod.push({
                    num,
                    name,
                    title,
                    year,
                    stream_id,
                    stream_icon,
                    rating,
                    plot,
                    genre,
                    release_date,
                    episode_run_time: episode_run_time ? episode_run_time.toString() : '',
                    category_id,
                    category_ids,
                    tmdb_id: null,
                    backdrop_path: '',
                    original_title: '',
                    overview: '',
                    poster_path: '',
                    runtime: null,
                    genres: '',
                    vote_average: null,
                    cast: '',
                    link: `${host}/movie/${user}/${password}/${stream_id}.${container_extension}`,
                    favorito: pelicula?.favorito ?? false,
                    visto: pelicula?.visto ?? false
                });

            });

            return newVod;
        } catch (error) {
            console.log(`Error al obtener el contenido de VOD: ${error}`);
        }
    };

    const getSeries = async () => {
        const newSeries = [];
        const newLink = `${url}&action=get_series`;
        const series = getItems('series');

        try {
            const response = await fetch(newLink);
            const stream = await response.json();

            stream.forEach(({ num, series_id, name, title, year, cover, plot, genre, category_id, category_ids, release_date, rating, backdrop_path }) => {
                const serie = series?.find(serie => serie.series_id === series_id);
                const regex = /Saga|Collection/i; // La 'i' hace que sea case-insensitive

                newSeries.push({
                    num,
                    name,
                    title,
                    year,
                    series_id,
                    cover,
                    plot,
                    genre,
                    release_date,
                    rating,
                    backdrop_path: backdrop_path[0],
                    category_id,
                    category_ids,
                    tmdb_id: null,
                    original_name: '',
                    backdrop_path_aux: '',
                    vote_average: null,
                    poster_path: '',
                    genres: '',
                    overview: '',
                    cast: '',
                    temporadas: (serie && serie.temporadas.length > 0) ? serie.temporadas : [],
                    favorito: serie?.favorito ?? false,
                    visto: serie?.visto ?? false,
                    saga: regex.test(name) ? true : false,
                });
            });

            return newSeries;
        } catch (error) {
            console.log(`Error al obtener el contenido de SERIES: ${error}`);
        }
    };

    const getEpisodes = async (idSerie) => {
        const newLink = `${url}&action=get_series_info&series_id=${idSerie}`;
        const serie = realm.objectForPrimaryKey('Serie', idSerie);

        try {
            if (serie && serie.temporadas.length > 0) {
                console.log('Ya existen episodios');
            } else {
                const response = await fetch(newLink);
                const stream = await response.json();
                transformEpisodes(stream, idSerie, serie);
                /*realm.write(() => {
                    serie.temporadas.push(...episodios);
                });*/
                console.log('Se agregaron los episodios');
                return true;
            }
        } catch (error) {
            console.log(`Error al obtener los episodios de la Serie con ID ${idSerie}: ${error}`);
        }
    };

    const transformEpisodes = (data, idSerie, serie) => {
        // data.episodes es un objeto cuyas claves son los números de temporada (en string)
        // y cada valor es un array de episodios de esa temporada
        Object.keys(data.episodes).forEach((seasonKey) => {
            // Para cada temporada, mapeamos los episodios y extraemos solo la información requerida
            const episodesInSeason = data.episodes[seasonKey].map((ep) => ({
                id: ep.id,
                episode_num: ep.episode_num,
                title: ep.title,
                plot: ep.info?.plot ?? '',
                duration_secs: ep.info?.duration_secs ?? 0,
                movie_image: ep.info?.movie_image ?? '',
                rating: ep.info?.rating?.toString() ?? '0',
                season: ep.season,
                id_serie: idSerie,
                link: `${host}/series/${user}/${password}/${ep.id}.${ep.container_extension}`,
                visto: false,
            }));

            try {
                realm.write(() => {
                serie.temporadas.push({
                    numero: seasonKey,
                    episodios: episodesInSeason
                });
            });
            } catch (error) {
                console.log('transformEpisodes: ', error);
            }
        });
    };

    return {
        getInfoAccount,
        getFullStreaming,
        getEpisodes,
    };
};
