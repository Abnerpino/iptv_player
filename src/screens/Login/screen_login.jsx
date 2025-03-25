import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import HostingController from '../../services/controllers/hostingController';
import TMDBController from '../../services/controllers/tmdbController';
import Contenido from '../../services/models/contenido';
import { useSelector } from 'react-redux';
import { useDispatch } from "react-redux";
import { activationSuccess, setID } from '../../services/redux/slices/activationSlice';

const Login = ({ navigation }) => {
  //Instancia del controlador de servicios de Hosting
  const hostingController = new HostingController();
  const contenido = new Contenido();
  const tmdbController = new TMDBController;
  const activacion = useSelector((state) => state.activation);
  console.log(activacion.id);
  console.log(activacion.isActive);
  console.log(activacion.error);
  const dispatch = useDispatch();

  //Estados para el manejo del ID del dispositivo y su nombre
  const [deviceId, setDeviceId] = useState(null);
  const [device, setDevice] = useState(null);

  //Estado para el manejo de Mensajes a mostrar en pantalla
  const [message, setMessage] = useState('');

  const tv = contenido.tv;
  const cine = contenido.cine;

  const getInfoSerie = async (series) => {
    const content = [];
    let repeatedTitle = ''; //Variable para comprobar si se repite un nombre de serie
    try {
      for (const serie of series) {
        //Devuelve un objeto con el nombre, # de temporada y # de episodio de una serie
        const dataSerie = getBasicDataSerie(serie['tvg-name']);
        //Solo se usa un episodio para obtener el nombre de la serie, los demás episodios se ignoran
        if (repeatedTitle === '' || repeatedTitle !== dataSerie.title) {
          repeatedTitle = dataSerie.title;
          const still = getStillPath(serie['tvg-logo']);
          const info = await tmdbController.findSerie(dataSerie.title, dataSerie.season, dataSerie.episode, still);
          content.push({
            id: info.id,
            'tvg-name': info.name,
            'tvg-logo': `https://image.tmdb.org/t/p/original${info.poster_path}`,
            'group-title': serie['group-title'],
            link: serie.link
          });
        }
      }
      //console.log(content);
      return content;
    } catch {
      console.log('Error al obtener la informacion de la serie.');
    }
  };

  useEffect(() => {
    const fetchDeviceId = async () => {
      try {
        // Genera un identificador unico para cada dispositvo
        let id = await DeviceInfo.getUniqueId(); // Espera a que la promesa se resuelva
        //console.log(id);
        let dev = await DeviceInfo.getDeviceName();
        console.log(dev);
        dispatch(setID(id));

        const result = await hostingController.obtenerDispositivo(id);

        if (result != null) {
          console.log(activacion.id);
          if (result['user_name'] !== "" && result['password'] !== "" && result['host'] !== "") {
            const series = await getInfoSerie(contenido.series);
            setMessage('Dispositivo registrado y con contenido');
            dispatch(activationSuccess(id));
            console.log(activacion.isActive);
            navigation.navigate('Menu', { tv, cine, series });
            //console.log(series);
          } else {
            setMessage('Dispositivo registrado pero sin contenido');
          }
        } else {
          setMessage('Dispositivo no registrado');
        }
        setDeviceId(id);
        setDevice(dev);
      } catch (error) {
        console.error("Error al generar el ID del dispositivo: ", error);
      }
    };

    fetchDeviceId();
  }, []);


  const handleRegisterDevice = async () => {
    const data = {
      "device_id": deviceId,
      "device": device,
      "client_name": '',
      "user_name": '',
      "password": '',
      "host": "http://tecnoactive.net:8080"
    };

    try {
      //hostingController.registrarDispositivo(data);
      setMessage('Dispositivo registrado con exito.');
      //console.log(series);
    } catch (error) {
      setMessage('Error al registrar dispostivo');
      console.error("Error");
    }
  }

  //De todo el titulo de la serie, obtiene el nombre, numero de temporada y de episodio
  function getBasicDataSerie(fullTitle) {
    const regex = /^(.*) S(\d{1,2})E(\d{1,2})$/;
    const match = fullTitle.match(regex);

    if (match) {
      const title = match[1].trim(); // El título de la serie
      const season = match[2].startsWith('0') ? match[2][1] : match[2]; // Ajustar temporada
      const episode = match[3].startsWith('0') ? match[3][1] : match[3]; // Ajustar capítulo

      return {
        title: title,
        season: season,
        episode: episode
      };
    } else {
      console.log('No se encontraron coincidencias.');
    }
  }

  function getStillPath(path) {
    const ultimoSlash = path.lastIndexOf('/'); // Encuentra la última posición de '/'
    return path.substring(ultimoSlash); // Extrae desde esa posición hasta el final
  }

  return (
    <View>
      <Text>ID del dispositivo: {deviceId || "Cargando..."}</Text>
      <TouchableOpacity onPress={handleRegisterDevice}>
        <View>
          <Text>Registrar dispositivo</Text>
        </View>
      </TouchableOpacity>
      <Text>{message}</Text>
    </View>
  );
};

export default Login;
