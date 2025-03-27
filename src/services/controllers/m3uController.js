import TMDBController from "./tmdbController";
import Categorias from "../models/categorias";

const tmdbController = new TMDBController;
const categorias = new Categorias();

const m3uContent = 
`#EXTINF:-1 tvg-id="Animal Planet.co" tvg-name="ANIMAL PLANET" tvg-logo="https://i.postimg.cc/V5QhtwSL/Sin-t-tulo-44-removebg-preview.png" group-title="CULTURA",ANIMAL PLANET
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
#EXTINF:-1 tvg-id="" tvg-name="Modern Love (2019) S2 E6" tvg-logo="https://image.tmdb.org/t/p/w1280/ounMQqutcC5pemP088YNnMlARZS.jpg" group-title="SERIES AMAZON",Modern Love (2019) S2 E6
http://teerom.site:8080/series/PinoFederico/Pino150601/391044.mp4
#EXTINF:-1 tvg-id="" tvg-name="Naruto Shippuden (2007) S5 E98" tvg-logo="https://image.tmdb.org/t/p/w400/kTIeFqVRR8U78XG433ZkGVjohO3.jpg" group-title="ANIME",Naruto Shippuden (2007) S5 E98
http://teerom.site:8080/series/PinoFederico/Pino150601/748511.mkv
#EXTINF:-1 tvg-id="" tvg-name="Harina (2022) S2 E8" tvg-logo="https://image.tmdb.org/t/p/w400/tXzuiWlK9sEwp7HiaJSjy6Dz8aM.jpg" group-title="SERIES AMAZON",Harina (2022) S2 E8
http://teerom.site:8080/series/PinoFederico/Pino150601/733669.mkv
#EXTINF:-1 tvg-id="" tvg-name="The Serpent Queen (2022) S1 E7" tvg-logo="https://image.tmdb.org/t/p/w400/c4ToXTSf9eBkpV6dLYuZ21aj3NS.jpg" group-title="SERIES STARZ",The Serpent Queen (2022) S1 E7
http://teerom.site:8080/series/PinoFederico/Pino150601/733088.mkv
#EXTINF:-1 tvg-id="" tvg-name="Planners (2023) S1 E4" tvg-logo="https://image.tmdb.org/t/p/w400/nBMg7OL4WaPMZ3NcgHtxnD4iy8k.jpg" group-title="SERIES STAR+ (FOX)",Planners (2023) S1 E4
http://teerom.site:8080/series/PinoFederico/Pino150601/732941.mkv`;

class M3UController {
    parseM3U = () => {
        const lines = m3uContent.split('\n').map(line => line.trim()); // Eliminar espacios en blanco
        let live = [];
        let movie = [];
        let seriesPromises = [];
      
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          if (line.startsWith('#EXTINF')) {
            const name = line.match(/tvg-name="([^"]+)"/); // Obtiene la información de la etiqueta tvg-name
            const logo = line.match(/tvg-logo="([^"]+)"/);; // Obtiene la información de la etiqueta tvg-logo
            const group = line.match(/group-title="([^"]+)"/);; // Obtiene la información de la etiqueta group-title
            const streamUrl = lines[i + 1];  // La URL del stream está en la siguiente línea
            const urlParts = streamUrl.split('/');
            // Extrae el contenido de acuerdo al tipo (live, movies, series)
            const contentType = urlParts.find(part => ['live', 'movie', 'series'].includes(part));
            if (contentType === 'live') {
              live.push({
                'tvg-name': name[1] || '',
                'tvg-logo': logo[1] || '',
                'group-title': group[1] || '',
                link: streamUrl || ''
              });
            } else if (contentType === 'movie') {
              movie.push({
                'tvg-name': name[1] || '',
                'tvg-logo': logo[1] || '',
                'group-title': group[1] || '',
                link: streamUrl || ''
              });
            } else {
              const title = this.separateTitle(name[1]);
              const still = this.getStillPath(logo[1]);

              const seriePromise = tmdbController.findSerie(title.name, title.year, title.season, title.episode, still)
                .then((info) => {
                  if (info) {
                   return {
                      id: info.id || '',
                      'tvg-name': `${title.name} (${title.year})` || '',
                      'tvg-logo': info.poster_path,
                      'group-title': group[1] || '',
                      link: streamUrl || ''
                    };
                  }
                  return null;
                })
                .catch((error) => {
                  throw new Error(`Error en la búsqueda de serie: ${error.message || error}`);
                });

              seriesPromises.push(seriePromise);
            }
          }
        }
        
        return Promise.all(seriesPromises).then(seriesResults  => {
          const series = seriesResults.filter(s => s !== null);
          return [live, movie, series];
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

    handleGetDataByType = () => {
      return this.parseM3U().then(([live, movie, series]) => {
          let categoria = [];
          let contenido = [];

          for (i = 0; i <= 2; i++) {
            let categories = [];
            let content = [];
          
            switch (i) {
              case 0:
                categories = categorias.tv;
                content = live;
                break;
              case 1:
                categories = categorias.cine;
                content = movie;
                break;
              case 2:
                categories = categorias.series;
                content = series;
                break;
            }
    
            categories.forEach(categorie => { // Para cada categoría...
                let cont = 0; // Variable para contar la cantidad de elementos en cada categoría
                if (categorie.name !== 'TODO') { // Si la categoría no es "TODO"
                    content.forEach(contenido => { // Para cada elemento en contenido...
                        if (categorie.name === contenido['group-title']) {
                            cont++;
                        }
                    });
                } else {
                    cont = content.length; // Si es "TODO", se obtiene el total de elementos
                }
                categorie.count = cont; // Actualiza el conteo en la categoría
            });

            categoria.push(categories);
            contenido.push(content);
          }

          return [categoria, contenido]; // Retorna un arreglo con las categorías y contenido
      }).catch(error => {
          console.error("Error crítico al obtener los datos:", error.message || error);
          return [[], []]; // Devuelve arrays vacíos en caso de error
      });
    };
      
}

export default M3UController;