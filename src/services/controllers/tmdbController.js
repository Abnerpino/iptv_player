const apiKey = '46cdd28e2e3e11e156481c7a3826cfc3';

class TMDBController {
    //Obtiene la informacion de una pelicula
    async getDataMovie(title, poster) {
        const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}&language=es-MX`;

        try {
            //Se buscan peliculas que coincidan con el nombre
            const searchResponse = await fetch(searchUrl);
            const searchData = await searchResponse.json();
            //if (data.results.lenght > 0) {}
            const info = searchData.results.find(result => poster === result.poster_path); //Se selecciona la que coincida con el poster
            const detalles = await this.getDetailsMovie(info.id); //Obtiene solo los detalles necesarios
            const creditos = await this.getCreditsMovie(info.id); //Obtiene solo los creditos necesarios
            return [detalles, creditos];
        } catch (error) {
            console.error('Error al obtener la pelicula: ', error);
        }
    }

    //Busca una serie usando la propiedad still_path de algun episodio de alguna temporada
    async findSerie(title, year, season, episode, still) {
        const searchUrl = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(title)}&year=${year}&language=es-MX`;

        try {
            //Se buscan series que coincidan con el nombre y año
            const searchResponse = await fetch(searchUrl);
            const searchData = await searchResponse.json();
            //Se itera sobre cada resultado buscando el primer episodio de la primera temporada 
            for (const result of searchData.results) {
                const matchUrl = `https://api.themoviedb.org/3/tv/${result.id}/season/${season}/episode/${episode}?api_key=${apiKey}&language=es-MX`;
                const matchResponse = await fetch(matchUrl);
                const matchData = await matchResponse.json();

                //Se compara el valor de la propiedad still_path
                if (still === matchData.still_path) {
                    const infoUrl = `https://api.themoviedb.org/3/tv/${result.id}?api_key=${apiKey}&language=es-MX`;
                    const infoResponse = await fetch(infoUrl);
                    const infoData = await infoResponse.json();
                    return infoData; // Devuelve la información de la serie que coincide
                }
            }

            return null; // Si no se encuentra ninguna coincidencia
        } catch (error) {
            console.log('Error al encontrar la serie: ', error);
        }
    }

    //Se buscan los detalles de la pelicula por su id
    async getDetailsMovie(id) {
        const detailsUrl = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=es-MX`;

        try {
            const detailsRespone = await fetch(detailsUrl);
            const detailsData = await detailsRespone.json();
            //Se guardan solo los detalles que son relevantes
            const details = {
                id: detailsData.id,
                original_title: detailsData.original_title,
                overview: detailsData.overview,
                release_date: detailsData.release_date,
                runtime: detailsData.runtime,
                vote_average: detailsData.vote_average,
                genres: detailsData.genres.map(genre => genre.name)
            };
            return details; //Se retorna el objeto con los detalles
        } catch (error) {
            console.log('Error al obtener los detallaes de la pelicula: ', error);
        }
    }

    //Se buscan los creditos de la pelicula por su id
    async getCreditsMovie(id) {
        const creditsUrl = `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${apiKey}&language=es-MX`;

        try {
            const creditsResponse = await fetch(creditsUrl);
            const creditsData = await creditsResponse.json();

            const credits = [];
            let cont = 1; // Inicializar el contador
            // Filtrar actores
            const actores = creditsData.cast
                .filter(actor => actor.known_for_department === "Acting")
                .map(actor => {
                    // Asignar imagen según la condición
                    const imagen = actor.profile_path === "null" ? null : `https://image.tmdb.org/t/p/w600_and_h900_bestv2${actor.profile_path}`;

                    return {
                        id: cont++, // Asignar el contador y luego incrementarlo
                        nombre: actor.name,
                        imagen: imagen
                    };
                });
            // Agregar el objeto de actores al arreglo credits
            credits.push(actores);
            
            return credits; //Se retorna el arreglo de objetos con los creditos
        } catch (error) {
            console.log('Error al obtener los creditos de la pelicula: ', error);
        }
    }
}

export default TMDBController;