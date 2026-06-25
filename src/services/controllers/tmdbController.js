import ErrorLogger from "../logger/errorLogger";

//Obtiene la informacion de una pelicula
export const getDataMovie = async (apiKey, title, year, poster, release, rating) => {
    const propYear = year ? `&year=${year}` : '';
    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}${propYear}&language=es-MX`;

    try {
        //Se buscan peliculas que coincidan con el titulo y el año
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        // Si hay por lo menos un resultado...
        if (searchData.total_results > 0) {
            // Busca alguna pelicula que coincida con el poster o con la fecha de estreno o con el título o con el titulo original
            let movie = searchData.results.find(result => poster === result.poster_path || release === result.release_date || title === result.title || title === result.original_title);
            // Si hay más de un resultado...
            if (searchData.total_results > 1) {
                // Agrupa las propiedades originales claves en un objeto
                const originalProps = {
                    poster_path: poster,
                    release_date: release
                };
                // Busca coincidencias entre las propiedades originales y las del resultado
                const matchs = movie ? Object.keys(movie).filter(prop => movie[prop] === originalProps[prop]).length : 0;
                // Si no existe la fecha de estreno y existe el rating y no hay coincidencias entre las props originales y las del resultado...
                if (!release && rating && matchs < 1) {
                    const votos = searchData.results.map(v => v.vote_average); // Genera un nuevo arreglo de los valores del promedio de votos
                    const approxVote = votos.reduce((previo, actual) => {
                        return Math.abs(actual - rating) < Math.abs(previo - rating) ? actual : previo; // Obtiene el voto más aproximado al original
                    });
                    const index = votos.indexOf(approxVote); // Obtiene el indice del voto aproximado
                    movie = searchData.results[index]; // Asigna la pelicula que contiene el voto aproximado
                }
            }
            // Si todavía no se ha asignado alguna pelicula, asigna la primera del array
            if (!movie) movie = searchData.results[0];
            //Obtiene la información completa de la pelicula seleccionada usando su id
            const info = await getDataMovieById(movie.id, apiKey);
            return info; // Retorna la información completa de la pelicula
        } else return null;
    } catch (error) {
        ErrorLogger.log('TMDBController - getDataMovie', error);
    }
};

const getDataMovieById = async (tmdbID, apiKey) => {
    try {
        const detalles = await getDetailsMovie(tmdbID, apiKey); //Obtiene solo los detalles necesarios
        const creditos = await getCreditsMovie(tmdbID, apiKey); //Obtiene solo los creditos necesarios
        return {
            tmdb_id: detalles.tmdb_id,
            backdrop_path: detalles.backdrop_path,
            original_title: detalles.original_title,
            overview: detalles.overview,
            poster_path: detalles.poster_path,
            runtime: detalles.runtime,
            genres: detalles.genres.map(genre => genre.name).join(', '),
            vote_average: detalles.vote_average,
            release_date: detalles.release_date,
            cast: JSON.stringify(creditos)
        };
    } catch (error) {
        ErrorLogger.log('TMDBController - getDataMovieById', error);
    }
};

//Obtiene la informacion de una serie
export const getDataSerie = async (apiKey, title, year, release, poster, backdrop, rating) => {
    const propYear = year ? `&year=${year}` : '';
    const searchUrl = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(title)}${propYear}&language=es-MX`;

    try {
        //Se buscan series que coincidan con el nombre y el año
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        // Si hay por lo menos un resultado...
        if (searchData.total_results > 0) {
            // Busca alguna serie que coincida con la fecha de estreno o con el poster o con la imagen de fondo con el nombre o con el nombre original
            let serie = searchData.results.find(result => release === result.first_air_date || poster === result.poster_path || backdrop === result.backdrop_path || title === result.name || title === result.original_name);
            // Si hay más de un resultado...
            if (searchData.total_results > 1) {
                // Agrupa las propiedades originales claves en un objeto
                const originalProps = {
                    first_air_date: release,
                    poster_path: poster,
                    backdrop_path: backdrop
                };
                // Busca coincidencias entre las propiedades originales y las del resultado
                const matchs = serie ? Object.keys(serie).filter(prop => serie[prop] === originalProps[prop]).length : 0;
                // Si no existe la fecha de estreno y existe el rating y no hay coincidencias entre las props originales y las del resultado...
                if (!release && rating && matchs < 1) {
                    const votos = searchData.results.map(v => v.vote_average); // Genera un nuevo arreglo de los valores del promedio de votos
                    const approxVote = votos.reduce((previo, actual) => {
                        return Math.abs(actual - rating) < Math.abs(previo - rating) ? actual : previo; // Obtiene el voto más aproximado al original
                    });
                    const index = votos.indexOf(approxVote); // Obtiene el indice del voto aproximado
                    serie = searchData.results[index]; // Asigna la serie que contiene el voto aproximado
                }
            }
            // Si todavía no se ha asignado alguna serie, asigna la primera del array
            if (!serie) serie = searchData.results[0];
            // Obtiene la información completa de la serie seleccionada usando su id
            const info = await getDataSerieById(serie.id, apiKey);
            return info; // Retorna la información completa de la serie
        } else return null;
    } catch (error) {
        ErrorLogger.log('TMDBController - getDataSerie', error);
    }
};

const getDataSerieById = async (tmdbID, apiKey) => {
    try {
        const detalles = await getDetailsSerie(tmdbID, apiKey); //Obtiene solo los detalles necesarios
        const creditos = await getCreditsSerie(tmdbID, apiKey); //Obtiene solo los creditos necesarios
        return {
            tmdb_id: detalles.tmdb_id,
            original_name: detalles.original_name,
            backdrop_path: detalles.backdrop_path,
            poster_path: detalles.poster_path,
            vote_average: detalles.vote_average,
            genres: detalles.genres.map(genre => genre.name).join(', '),
            overview: detalles.overview,
            first_air_date: detalles.first_air_date,
            cast: JSON.stringify(creditos)
        };
    } catch (error) {
        ErrorLogger.log('TMDBController - getDataSerieById', error);
    }
};

//Se buscan los detalles de la pelicula por su id
const getDetailsMovie = async (id, apiKey) => {
    const detailsUrl = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=es-MX`;

    try {
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();
        //Se guardan solo los detalles que son relevantes
        const details = {
            tmdb_id: detailsData.id,
            backdrop_path: detailsData.backdrop_path,
            original_title: detailsData.original_title,
            overview: detailsData.overview,
            poster_path: detailsData.poster_path,
            runtime: detailsData.runtime,
            vote_average: detailsData.vote_average,
            release_date: detailsData.release_date,
            genres: detailsData.genres
        };
        return details; //Se retorna el objeto con los detalles
    } catch (error) {
        ErrorLogger.log('TMDBController - getDetailsMovie', error);
    }
};

//Se buscan los detalles de la serie por su id
const getDetailsSerie = async (id, apiKey) => {
    const detailsUrl = `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&language=es-MX`;

    try {
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();
        //Se guardan solo los detalles que son relevantes
        const details = {
            tmdb_id: detailsData.id,
            original_name: detailsData.original_name,
            backdrop_path: detailsData.backdrop_path,
            vote_average: detailsData.vote_average,
            poster_path: detailsData.poster_path,
            genres: detailsData.genres,
            first_air_date: detailsData.first_air_date,
            overview: detailsData.overview
        };
        return details; //Se retorna el objeto con los detalles
    } catch (error) {
        ErrorLogger.log('TMDBController - getDetailsSerie', error);
    }
};

//Se buscan los creditos de la pelicula por su id
const getCreditsMovie = async (id, apiKey) => {
    const creditsUrl = `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${apiKey}&language=es-MX`;

    try {
        const creditsResponse = await fetch(creditsUrl);
        const creditsData = await creditsResponse.json();

        const credits = creditsData.cast
            .filter(actor => actor.known_for_department === "Acting")
            .map(actor => {
                // Asignar imagen según la condición
                const imagen = actor.profile_path === "null" ? null : `https://image.tmdb.org/t/p/w600_and_h900_bestv2${actor.profile_path}`;

                return {
                    nombre: actor.name,
                    imagen: imagen
                };
            });

        return credits; //Se retorna el arreglo de objetos con los creditos
    } catch (error) {
        ErrorLogger.log('TMDBController - getCreditsMovie', error);
    }
};

//Se buscan los creditos de la serie por su id
const getCreditsSerie = async (id, apiKey) => {
    const creditsUrl = `https://api.themoviedb.org/3/tv/${id}/credits?api_key=${apiKey}&language=es-MX`;

    try {
        const creditsResponse = await fetch(creditsUrl);
        const creditsData = await creditsResponse.json();

        const actores = creditsData.cast
            .filter(actor => actor.known_for_department === "Acting")
            .map(actor => {
                // Asignar imagen según la condición
                const imagen = actor.profile_path === "null" ? null : `https://image.tmdb.org/t/p/w600_and_h900_bestv2${actor.profile_path}`;

                return {
                    nombre: actor.name,
                    imagen: imagen
                };
            });

        return actores; //Se retorna el arreglo de objetos con los creditos
    } catch (error) {
        ErrorLogger.log('TMDBController - getCreditsSerie', error);
    }
};