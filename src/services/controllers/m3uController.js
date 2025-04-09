import TMDBController from "./tmdbController";

const tmdbController = new TMDBController;

const m3uContent = 
`#EXTM3U
#EXTINF:-1 tvg-id="Animal Planet.co" tvg-name="ANIMAL PLANET" tvg-logo="https://i.postimg.cc/V5QhtwSL/Sin-t-tulo-44-removebg-preview.png" group-title="CULTURA",ANIMAL PLANET
http://teerom.site:8080/live/PinoFederico/Pino150601/6105.m3u8
#EXTINF:-1 tvg-id="DISCOVERY SCIENCE" tvg-name="DISCOVERY SCIENCE (exclusivo HD)" tvg-logo="https://i.postimg.cc/vBdQdPHS/Sin-t-tulo-57-removebg-preview.png" group-title="CULTURA",DISCOVERY SCIENCE (exclusivo HD)
http://teerom.site:8080/live/PinoFederico/Pino150601/6115.m3u8
#EXTINF:-1 tvg-id="DISCOVERY HD THEATER" tvg-name="DISCOVERY THEATER (exclusivo FULL HD)" tvg-logo="https://i.postimg.cc/brySqYNM/Sin-t-tulo-58-removebg-preview.png" group-title="CULTURA",DISCOVERY THEATER (exclusivo FULL HD)
http://teerom.site:8080/live/PinoFederico/Pino150601/6120.m3u8
#EXTINF:-1 tvg-id="" tvg-name="UNICANAL | OPCION 1️⃣" tvg-logo="https://i.postimg.cc/FH9WbSWR/My-project-4-removebg-preview.png" group-title="PARAGUAY TV",UNICANAL | OPCION 1️⃣
http://teerom.site:8080/live/PinoFederico/Pino150601/87407.m3u8
#EXTINF:-1 tvg-id="" tvg-name="ABC TV" tvg-logo="https://i.postimg.cc/T2cTqzfJ/My-project-9-removebg-preview.png" group-title="PARAGUAY TV",ABC TV
http://teerom.site:8080/live/PinoFederico/Pino150601/87425.m3u8
#EXTINF:-1 tvg-id="" tvg-name="CANAL 8 (exclusivo)" tvg-logo="https://i.postimg.cc/6qV64yK4/My-project-3-removebg-preview.png" group-title="COSTA RICA TV",CANAL 8 (exclusivo)
http://teerom.site:8080/live/PinoFederico/Pino150601/87701.m3u8
#EXTINF:-1 tvg-id="" tvg-name="El rapto (2023)" tvg-logo="https://image.tmdb.org/t/p/w400/7ayaN1HSWcBO8ODQmONQKzleZep.jpg" group-title="CINE ESTRENOS 2023",El rapto (2023)
http://teerom.site:8080/movie/PinoFederico/Pino150601/651302.mkv
#EXTINF:-1 tvg-id="" tvg-name="Return (2023)" tvg-logo="https://image.tmdb.org/t/p/w400/eFUAxw9l8Kz8PJhBQzCkAGMkoHB.jpg" group-title="CINE ESTRENOS 2023",Return (2023)
http://teerom.site:8080/movie/PinoFederico/Pino150601/651303.mkv
#EXTINF:-1 tvg-id="" tvg-name="Toy Story (1995)" tvg-logo="https://image.tmdb.org/t/p/w400/jvn7wy3RSNEXnFSXLpH2of2LcV6.jpg" group-title="CINE DE CULTO",Toy Story (1995)
http://teerom.site:8080/movie/PinoFederico/Pino150601/663685.mkv
#EXTINF:-1 tvg-id="" tvg-name="Transformers: Beginnings (2007)" tvg-logo="https://image.tmdb.org/t/p/w400/q61s5H2DRHSJYx75adOtTL3aFuY.jpg" group-title="CINE DE CULTO",Transformers: Beginnings (2007)
http://teerom.site:8080/movie/PinoFederico/Pino150601/663645.mkv
#EXTINF:-1 tvg-id="" tvg-name="Los siete magníficos (2016)" tvg-logo="https://image.tmdb.org/t/p/w400/uotXQy2IKigAA6vvUIUsBPNHkH0.jpg" group-title="CINE DE CULTO",Los siete magníficos (2016)
http://teerom.site:8080/movie/PinoFederico/Pino150601/663626.mkv
#EXTINF:-1 tvg-id="" tvg-name="Resurgir (2022)" tvg-logo="https://image.tmdb.org/t/p/w400/1Llmpsg6iI8jWzl7WDXWe8H1sx9.jpg" group-title="CINE ESTRENOS 2022",Resurgir (2022)
http://teerom.site:8080/movie/PinoFederico/Pino150601/683009.mkv
#EXTINF:-1 tvg-id="" tvg-name="Yo soy Betty, la fea (1999) S1 E249" tvg-logo="https://image.tmdb.org/t/p/w400/25logyYT1YLBBt2LmIULDF2rbq2.jpg" group-title="NOVELAS",Yo soy Betty, la fea (1999) S1 E249
http://teerom.site:8080/series/PinoFederico/Pino150601/747373.mp4
#EXTINF:-1 tvg-id="" tvg-name="Viva el rey Julien (2017) S1 E1" tvg-logo="https://image.tmdb.org/t/p/w400/aqpj9winukvS76b4r3jXzOIJnHc.jpg" group-title="SERIES NETFLIX",Viva el rey Julien (2017) S1 E1
http://teerom.site:8080/series/PinoFederico/Pino150601/770378.mkv
#EXTINF:-1 tvg-id="" tvg-name="Viva el rey Julien (2017) S1 E2" tvg-logo="https://image.tmdb.org/t/p/w400/8sgzS33QSIBBDCHmK0phBOpDnvF.jpg" group-title="SERIES NETFLIX",Viva el rey Julien (2017) S1 E2
http://teerom.site:8080/series/PinoFederico/Pino150601/770376.mkv
#EXTINF:-1 tvg-id="" tvg-name="Modern Love (2019) S2 E6" tvg-logo="https://image.tmdb.org/t/p/w1280/ounMQqutcC5pemP088YNnMlARZS.jpg" group-title="SERIES AMAZON",Modern Love (2019) S2 E6
http://teerom.site:8080/series/PinoFederico/Pino150601/391044.mp4
#EXTINF:-1 tvg-id="" tvg-name="Naruto Shippuden (2007) S3 E54" tvg-logo="https://image.tmdb.org/t/p/w400/idGgNw7PluhW3ZVwAYTBNwAoNrv.jpg" group-title="ANIME",Naruto Shippuden (2007) S3 E54
http://teerom.site:8080/series/PinoFederico/Pino150601/748484.mkv
#EXTINF:-1 tvg-id="" tvg-name="Naruto Shippuden (2007) S5 E98" tvg-logo="https://image.tmdb.org/t/p/w400/kTIeFqVRR8U78XG433ZkGVjohO3.jpg" group-title="ANIME",Naruto Shippuden (2007) S5 E98
http://teerom.site:8080/series/PinoFederico/Pino150601/748511.mkv
#EXTINF:-1 tvg-id="" tvg-name="Naruto Shippuden (2007) S5 E101" tvg-logo="https://image.tmdb.org/t/p/w400/fqCAShbd8A5DVwYO09494gj8VmF.jpg" group-title="ANIME",Naruto Shippuden (2007) S5 E101
http://teerom.site:8080/series/PinoFederico/Pino150601/748514.mkv
#EXTINF:-1 tvg-id="" tvg-name="Naruto Shippuden (2007) S6 E123" tvg-logo="https://image.tmdb.org/t/p/w400/aCGBVD4ojyerrmWbEgMUcTzoZfz.jpg" group-title="ANIME",Naruto Shippuden (2007) S6 E123
http://teerom.site:8080/series/PinoFederico/Pino150601/748547.mkv
#EXTINF:-1 tvg-id="" tvg-name="Naruto Shippuden (2007) S6 E124" tvg-logo="https://image.tmdb.org/t/p/w400/q82Th2fRyYx9mjJIW8shmp95X7M.jpg" group-title="ANIME",Naruto Shippuden (2007) S6 E124
http://teerom.site:8080/series/PinoFederico/Pino150601/748549.mkv
#EXTINF:-1 tvg-id="" tvg-name="Naruto Shippuden (2007) S6 E125" tvg-logo="https://image.tmdb.org/t/p/w400/kfR7oaPZGavG7A8UD6zXRRLtqQb.jpg" group-title="ANIME",Naruto Shippuden (2007) S6 E125
http://teerom.site:8080/series/PinoFederico/Pino150601/748546.mkv
#EXTINF:-1 tvg-id="" tvg-name="Harina (2022) S2 E8" tvg-logo="https://image.tmdb.org/t/p/w400/tXzuiWlK9sEwp7HiaJSjy6Dz8aM.jpg" group-title="SERIES AMAZON",Harina (2022) S2 E8
http://teerom.site:8080/series/PinoFederico/Pino150601/733669.mkv
#EXTINF:-1 tvg-id="" tvg-name="The Serpent Queen (2022) S1 E7" tvg-logo="https://image.tmdb.org/t/p/w400/c4ToXTSf9eBkpV6dLYuZ21aj3NS.jpg" group-title="SERIES STARZ",The Serpent Queen (2022) S1 E7
http://teerom.site:8080/series/PinoFederico/Pino150601/733088.mkv
#EXTINF:-1 tvg-id="" tvg-name="Planners (2023) S1 E4" tvg-logo="https://image.tmdb.org/t/p/w400/nBMg7OL4WaPMZ3NcgHtxnD4iy8k.jpg" group-title="SERIES STAR+ (FOX)",Planners (2023) S1 E4
http://teerom.site:8080/series/PinoFederico/Pino150601/732941.mkv
#EXTINF:-1 tvg-id="" tvg-name="Planners (2023) S1 E8" tvg-logo="https://image.tmdb.org/t/p/w400/uEINGmTb5u6IbCyfRgvTxXOmQoo.jpg" group-title="SERIES STAR+ (FOX)",Planners (2023) S1 E8
http://teerom.site:8080/series/PinoFederico/Pino150601/732942.mkv
#EXTINF:-1 tvg-id="" tvg-name="Planners (2023) S1 E9" tvg-logo="https://image.tmdb.org/t/p/w400/3SeIrUo3R8DtiV9Mo8aV37aGNS5.jpg" group-title="SERIES STAR+ (FOX)",Planners (2023) S1 E9
http://teerom.site:8080/series/PinoFederico/Pino150601/732938.mkv`;

class M3UController {
    parseM3U = (movies, categoriasPelis, series, categoriasSeries) => {
        const totalFavMovies = categoriasPelis?.find(item => item.id === 3)?.total ?? 0; //Obtiene el total de peliculas de la categoria Favortios si es que ya hay peliculas guardadas
        const totalFavSeries = categoriasSeries?.find(item => item.id === 3)?.total ?? 0; //Obtiene el total de series de la categoria Favortios si es que ya hay series guardadas
        let live = []; //Arreglo para guardar los canales en vivo
        let catsLive = [{ id: 1, name: 'TODO', total: 0 }, { id: 2, name: 'RECIENTEMENTE VISTO', total: 0 }, { id: 3, name: 'FAVORITOS', total: 0 }]; //Arreglo para almacenar las categorias de los canales
        let contLiveId = 4; //Contador para el id de cada categoria de canales, inicia en 4 porque ya existen tres categorias
        let movie = []; //Arreglo para guardar las peliculas
        let catsMovie = [{ id: 1, name: 'TODO', total: 0 }, { id: 2, name: 'RECIENTEMENTE MIRADA', total: 0 }, { id: 3, name: 'FAVORITOS', total: totalFavMovies }]; //Arreglo para almacenar las categorias de las peliculas
        let contMovieId = 4; //Contador para el id de cada categoria de peliculas, inicia en 4 porque ya existen tres categorias
        let seriesPromises = []; //Arreglo para guardar las series de cada promesa
        let catsSerie = [{ id: 1, name: 'TODO', total: 0 }, { id: 2, name: 'RECIENTEMENTE MIRADA', total: 0 }, { id: 3, name: 'FAVORITOS', total: totalFavSeries }]; //Arreglo para almacenar las categoriasde las series
        let contSerieId = 4; //Contador para el id de cada categoria de series, inicia en 4 porque ya existen tres categorias
        let sameSerie = ''; //Guarda el titulo (nombre y año) de una Serie para evitar consultas repetidas
        
        let isSameSerie = true; //Bandera para verificar cuando una Serie sea repetida
        let i = 1; //Inicializamos en 1 el indice principal porque la primera linea (indice 0) solo contiene #EXTM3U, ¡INICIAR EN 0 SI LA PRIMERA LINEA DE SU LISTA INICIA DIRECTAMENTE CON #EXTINF!
        const lines = m3uContent.split('\n').map(line => line.trim()); // Genera un arreglo con todas las lineas de la lista M3U
      
        while (i < lines.length) { //Mientras el indice sea menor que la cantidad de lineas de la lista
          const currentLine = lines[i]; //Obtiene la linea actual con base en el indice
          
          if (currentLine.startsWith('#EXTINF')) { //Si la linea comienza con #EXTINF significa que es una linea que contiene información del contenido
            const name = currentLine.match(/tvg-name="([^"]+)"/); // Obtiene la información de la etiqueta tvg-name
            const logo = currentLine.match(/tvg-logo="([^"]+)"/);; // Obtiene la información de la etiqueta tvg-logo
            const group = currentLine.match(/group-title="([^"]+)"/);; // Obtiene la información de la etiqueta group-title
            const streamUrl = lines[i + 1];  // La URL del stream está en la siguiente línea
            const urlParts = streamUrl.split('/'); //Divide la url cada vez que hay un /
            const contentType = urlParts.find(part => ['live', 'movie', 'series'].includes(part)); // Extrae el contenido de acuerdo al tipo (live, movies, series)
            
            if (contentType === 'live') { //Si el tipo de contenido es live, significa que son canales en vivo
              catsLive[0].total++; //Suma 1 al valor del total de la primera categoria (TODO)
              const existeCat = catsLive.find(categoria => categoria.name === group[1]); //Busca la categoria de la linea actual

              if (existeCat) { //Si ya existe la categoria...
                existeCat.total++; //Suma 1 al valor del total de la categoria de la linea actual
              } else { //Si es una nueva categoria...
                catsLive.push({ //Agrega la categoria al arreglo de categorias de canales en vivo
                  id: contLiveId++,
                  name: group[1],
                  total: 1
                });
              }

              live.push({
                'tvg-name': name[1] || '',
                'tvg-logo': logo[1] || '',
                'group-title': group[1] || '',
                link: streamUrl || ''
              });
            } else if (contentType === 'movie') { //Si el tipo de contenido es movie, significa que son peliculas
              catsMovie[0].total++; //Suma 1 al valor del total de la primera categoria (TODO)
              const existeCat = catsMovie.find(categoria => categoria.name === group[1]); //Busca la categoria de la linea actual

              if (existeCat) { //Si ya existe la categoria...
                existeCat.total++; //Suma 1 al valor del total de la categoria de la linea actual
              } else { //Si es una nueva categoria...
                catsMovie.push({ //Agrega la categoria al arreglo de categorias de peliculas
                  id: contMovieId++,
                  name: group[1],
                  total: 1
                });
              }

              const isMovieFav = movies?.find(item => item['tvg-name'] === name[1])?.favorito ?? false; //Obtiene, cuando ya hay peliculas guardadas, el valor que indica si una pelicula está agregada a Favortios o no

              movie.push({
                'tvg-name': name[1] || '',
                'tvg-logo': logo[1] || '',
                'group-title': group[1] || '',
                link: streamUrl || '',
                visto: false,
                favorito: isMovieFav
              });
            } else { //Si el tipo de contenido no es ni live ni movie, significa que son series
              const title = this.separateTitle(name[1]);

              if (`${title.name} (${title.year})` !== sameSerie) { //Evita hacer la consulta si la información corresponde a la misma Serie
                sameSerie = `${title.name} (${title.year})`;
                const still = this.getStillPath(logo[1]);
                const seasons = []; //Arreglo para guardar todas las temporadas de una Serie
                let season = {}; //Objeto para guardar el numero de temporada y sus capitulos
                let chapters = [] //Arreglo para guardar todos los capitulos de una temporada
                let sameSeason = ''; //Variable que guarda la temporada de la Serie anterior
                let j = i; //Inicializa el indice secundario (j) con el mismo valor del indice principal (i)

                while ((j < lines.length) && (isSameSerie === true )) { //Recorre todas las lineas a partir de donde inicia una Seríe hasta que inicia otra
                  if (lines[j].startsWith('#EXTINF')) { //Si la linea tiene información válida...
                    const auxName = lines[j].match(/tvg-name="([^"]+)"/);
                    const auxTitle = this.separateTitle(auxName[1]);

                    if (`${auxTitle.name} (${auxTitle.year})` === sameSerie) { //Si la información corresponde a la misma Serie...
                      const auxLogo = lines[j].match(/tvg-logo="([^"]+)"/);
                      const auxStreamUrl = lines[j + 1];

                      if (auxTitle.season !== sameSeason) { //Si la temporada actual es diferente a la temporada anterior...
                        sameSeason = auxTitle.season; //Asigna el valor de la temporada de la Serie de la linea actual
                        if (chapters.length > 0) { //Si hay capitulos dentro del arreglo...
                          let caps = { capitulos: chapters} //Guarda los capitulos de la temporada en un nuevo objeto
                          Object.assign(season, caps); //Agrega el par clave-valor del nuevo objeto al objeto existente
                          seasons.push(season); //Agrega cada temporada de una Serie
                          chapters = new Array(); //Crea una nueva instancia para limpiar el arreglo
                          season = new Object(); //Crea una nueva instancia para limpiar el objeto
                        }

                        let numSeason = { temporada: auxTitle.season }; //Guarda el numero de temporada en un nuevo objeto
                        Object.assign(season, numSeason); //Agrega el par clave-valor del nuevo objeto al objeto existente
                      }

                      const chapter = { //Objeto que guarda la información de un capitulo
                        capitulo: auxTitle.episode,
                        poster: auxLogo[1],
                        link: auxStreamUrl
                      };
                      
                      chapters.push(chapter); //Agrega el capitulo al arreglo de capitulos por temporada
                    } else { //Si la información no corresponde a la misma Serie...
                      /*Este condicional se repite en esta sección porque al cambiar de Serie, el flujo del código ya no entra al condicional original,
                      por lo que es necesario repetirlo aquí para guardar la información obtenida de temporadas y capitulos*/
                      if (chapters.length > 0) {
                        let caps = { capitulos: chapters}
                        Object.assign(season, caps);
                        seasons.push(season);
                        //La creación de nuevas instancias se omite aquí porque en cada cambio de Serie, las estructuras usadas se vuelven a declarar
                      }

                      isSameSerie = false; //Hacemos falsa la bandera para salir del while
                      j = j - 2; //Decrementamos el contador para evitar que cuando se haga el incremento al final de la iteración, se permanezca en la misma linea en la que se cambió la Serie
                    }
                  }
                  j = j + 2; //Incrementamos el contador para avanzar a la siguiente linea

                  /*Este condicional se vuelve a repetir en esta sección porque cuando lee la ultima linea de la lista, el flujo del código ya no regresa al condicional original ni al segundo,
                  por lo que es necesario volver a repetirlo aquí para guardar la información obtenida de temporadas y capitulos de la ultima linea*/
                  if (j >= lines.length) { //Si el indice de la siguiente linea supera el tamaño del arreglo, es decir, que la lista terminó en la linea anterior...
                    let caps = { capitulos: chapters}
                    Object.assign(season, caps);
                    seasons.push(season);
                  }
                }

                catsSerie[0].total++; //Suma 1 al valor del total de la primera categoria (TODO)
                const existeCat = catsSerie.find(categoria => categoria.name === group[1]); //Busca la categoria de la linea actual

                if (existeCat) { //Si ya existe la categoria...
                  existeCat.total++; //Suma 1 al valor del total de la categoria de la linea actual
                } else { //Si es una nueva categoria...
                  catsSerie.push({ //Agrega la categoria al arreglo de categorias de series
                    id: contSerieId++,
                    name: group[1],
                    total: 1
                  });
                }

                //Consulta para obtener la información de una Serie mediante el nombre, año, temporada, capitulo y poster
                const seriePromise = tmdbController.findSerie(title.name, title.year, title.season, title.episode, still)
                .then((info) => {
                  if (info) { //Si devuelve información...
                    const isSerieFav = series?.find(item => item.id === info.id)?.favorito ?? false; //Obtiene, cuando ya hay series guardadas, el valor que indica si una serie está agregada a Favortios o no

                    return {
                      id: info.id || '',
                      'tvg-name': `${title.name} (${title.year})` || '',
                      'tvg-logo': info.poster_path,
                      'group-title': group[1] || '',
                      link: streamUrl || '',
                      temporadas: seasons,
                      favorito: isSerieFav
                    };
                  }
                  return null;
                })
                .catch((error) => {
                  throw new Error(`Error en la búsqueda de serie: ${error.message || error}`);
                });
                
                seriesPromises.push(seriePromise); //Agrega cada promesa, la cual contiene una serie
                i = j; //Con esta asignación, el indice principal se brinca hasta donde comienza la siguiente Serie
              }
            }
          }
          if (isSameSerie === false) {
            isSameSerie = true; //Restablecemos la bandera a su valor original 
          } else {
            i = i + 2; //Incrementamos el indice para analizar la siguiente linea con información (nos brincamos directamente las lineas que solo tienen la URL del stream), esto solo se aplica para live y movie
          }
        }
        
        return Promise.all(seriesPromises).then(seriesResults  => {
          const series = seriesResults.filter(s => s !== null);
          return [[catsLive, live], [catsMovie, movie], [catsSerie, series]];
        });
    };

    separateTitle(titulo) {
      const regex = /(.*?)\s\((\d{4})\)\sS(\d+)\sE(\d+)/;
      const match = titulo.match(regex);

      return { // Retorna por separado la información
          name: match[1],   // Nombre de la serie
          year: match[2],   // Año de estreno
          season: match[3], // Número de temporada
          episode: match[4] // Número de episodio
      };
    }

    getStillPath(path) {
      const ultimoSlash = path.lastIndexOf('/'); // Encuentra la última posición de '/'
      return path.substring(ultimoSlash); // Extrae desde esa posición hasta el final
    }

    handleGetDataByType = (pelis, catsPelis, series, catsSeries) => {
      return this.parseM3U(pelis, catsPelis, series, catsSeries).then(([live, movie, serie]) => {
          let categorias = []; //Arreglo para guardar todas las categorias
          let contenido = []; //Arreglo para guardar todo el contenido

          for (i = 0; i <= 2; i++) { //Itera tres veces, una vez por cada tipo de contenido
            switch (i) {
              case 0:
                categorias.push(live[0]); //Obtiene las categorias de los canales
                contenido.push(live[1]); //Obtiene el contenido de los canales
                break;
              case 1:
                categorias.push(movie[0]); //Obtiene las categorias de las peliculas
                contenido.push(movie[1]); //Obtiene el contenido de las peliculas
                break;
              case 2:
                categorias.push(serie[0]); //Obtiene las categorias de las series
                contenido.push(serie[1]); //Obtiene el contenido de las series
                break;
            }
          }

          return [categorias, contenido]; // Retorna un arreglo con las categorías y el contenido
      }).catch(error => {
          console.error("Error crítico al obtener los datos:", error.message || error);
          return [[], []]; // Devuelve arrays vacíos en caso de error
      });
    };
      
    render() {
      return null; // Ajusta según lo que necesites renderizar
    }
}

export default M3UController;