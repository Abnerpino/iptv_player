import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, Image, ScrollView, StyleSheet, Pressable, ToastAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon3 from 'react-native-vector-icons/MaterialIcons';
import Icon4 from 'react-native-vector-icons/Feather';
import Icon5 from 'react-native-vector-icons/Ionicons';
import Clipboard from '@react-native-clipboard/clipboard';
import { Linking } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setClientName, setExpirationDate, setHost, setID, setIsActive, setIsRegistered, setPassword, setPurchasedPackage, setUser, setUsername } from '../../services/redux/slices/clientSlice';
import { setListNotifications } from '../../services/redux/slices/notificationsSlice';
import HostingController from '../../services/controllers/hostingController';
import ModalLoading from '../../components/Modals/modal_loading';

const hostingController = new HostingController();

const Activation = ({ navigation, route }) => {
  const usuarios = route.params.data; //Recupera la lista de usuarios existentes
  const { id, deviceId, username, deviceModel, android, isRegistered, isActive } = useSelector(state => state.client);
  const dispatch = useDispatch();
  const [name, setName] = useState(''); //Estado para manejar el nombre ingresado
  const [localUsername, setLocalUsername] = useState(''); //Estado para manejar el nombre de usuario ingresado
  const [visible, setVisible] = useState(false); //Estado para manejar la visibilidad del tooltip
  const [error, setError] = useState(''); //Estado para el manejo de los mensajes de error
  const [isWriting, setIsWriting] = useState(false); //Estado para el manejo de cuando se escriba por primera vez
  const [timer, setTimer] = useState(0); //Estado para manejar el temporizador
  const [loading, setLoading] = useState(false); //Estado para manejar el modal de carga

  const handleStartLoading = () => setLoading(true); //Cambia el valor a verdadero para que se muestre el modal de carga
  const handleFinishLoading = () => setLoading(false); //Cambia el valor a falso para que se cierre el modal de carga

  // Maneja la validación del nombre de usuario (longitud minima y si ya existe)
  useEffect(() => {
    if (!isWriting) return; // ← Evita validar al principio

    const validateUsername = () => {
      const filtered = localUsername.replace(/[^a-zA-Z0-9_\-.]/g, '');
      if (filtered.length < 4) {
        setError('La longitud mínima es de 4 caracteres');
      } else if (usuarios.includes(filtered.toLowerCase())) {//(usuarios.some(usuario => usuario.toLowerCase().includes(filtered.toLowerCase()))) {
        setError('¡Ya existe ese usuario! Ingrese uno diferente');
      } else {
        setError('');
      }
    };

    validateUsername();
  }, [localUsername, isWriting]); // ← Se ejecuta cada vez que cambia el username

  // Maneja el temporizador
  useEffect(() => {
    if (timer === 0) return; // Si llega a 0, no hacer nada

    const temporizador = setInterval(() => {
      setTimer((segundos) => segundos - 1);
    }, 1000);

    return () => clearInterval(temporizador); // Limpiar el intervalo al desmontar o cambiar contador
  }, [timer]);

  // Función para filtrar caracteres especiales y numeros en el nombre
  const filterName = (name) => {
    return name.replace(/[^a-zA-Z ]/g, ''); // Reemplaza todo lo que no sea letra o espacios por vacío
  };

  // Función para filtrar caracteres especiales en el nombre de usuario
  const filterUsername = (input) => {
    if (!isWriting) setIsWriting(true); // ← Marca que el usuario ya escribió en el input

    const filtered = input.replace(/[^a-zA-Z0-9_\-.]/g, ''); // Reemplaza todo lo que no sea letra o espacios o guiones o puntos, por vacío
    setLocalUsername(filtered); // Solo se actualiza, la validación ahora está en el useEffect
  };

  // Función para validar el registro
  const validateRegistration = async () => {
    setError(''); //Borra el mensaje de error si es que hay
    setVisible(false); //Cierra el tooltip si está abierto
    handleStartLoading?.(); // Inicia el modal de carga
    const response = await handleRegisterDevice();
    handleFinishLoading?.(); // Termina el modal de carga

    if (response) {
      dispatch(setClientName(name.trim()));
      dispatch(setUsername(localUsername));
      dispatch(setIsRegistered(true));
      setError('');
    } else {
      setError('¡Ocurrió un error en el registro! Intente de nuevo');
    }
  };

  const handleRegisterDevice = async () => {
    const info = {
      "device_id": deviceId,
      "client_name": name.trim(),
      "user_name": localUsername,
      "user": '',
      "password": '',
      "host": '',
      "active": false,
      "expiration": '',
      "package": '',
      "device_model": deviceModel,
      "android": android,
    };

    const response = await hostingController.registrarCliente(info);
    return response;
  }

  const copyUsername = () => {
    Clipboard.setString(localUsername); // Copia el nombre de usuario al portapapeles
    ToastAndroid.show('¡Usuario copiado al portapapeles!', ToastAndroid.SHORT);
  };

  const openWhatsApp = async () => {
    let number = '+527421132908';
    let message = `ACTIVACIÓN DE CUENTA IPTV PLAYER\n\nUsuario: *${localUsername}*`;
    let url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

    Linking.openURL(url)
      .catch(() => ToastAndroid.show('No se pudo abrir WhatsApp', ToastAndroid.SHORT));
  };

  const validateActivation = async () => {
    handleStartLoading?.(); // Inicia el modal de carga
    const response = await hostingController.verificarCliente(deviceId); //Consultamos la información del cliente para verficar su activación
    const notifications = await hostingController.obtenerNotificaciones(response ? response.id : '00000');
    handleFinishLoading?.(); // Termina el modal de carga

    if (response) { //Si devuelve una respuesta valida...
      if (response.active) { //Si la cuenta ya está activa...
        dispatch(setID(response.id));
        dispatch(setUser(response.user));
        dispatch(setPassword(response.password));
        dispatch(setHost(response.host));
        dispatch(setIsActive(true));
        dispatch(setExpirationDate(response.expiration));
        dispatch(setPurchasedPackage(response.package));
        dispatch(setListNotifications(notifications ? notifications : []));
        navigation.replace('Menu');
      } else { //Si la cuenta no está activa...
        setTimer(60);
        setError('¡Su cuenta está inactiva!');
      }
    } else { // Si no devuelve una respuesta valida...
      setError('¡Error en la verificación! Intente de nuevo');
    }
  }

  return (
    <ImageBackground
      source={require('../../assets/fondo.jpg')}
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
      }}
      resizeMode='cover'
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.textHeader}>BIENVENIDO  A</Text>
          <Image
            source={require('../../assets/imagotipo.png')}
            style={{ height: '100%', width: '26%', resizeMode: 'contain', alignSelf: 'flex-start', }}
          />
        </View>
        {!isRegistered ? (
          <View style={{ marginTop: 20, }}>
            <Text style={styles.indication}>¡Para comenzar a disfrutar de todo el contenido, el primer paso es registrarse! Llene los campos a continuación y después pulse el botón para finalizar el registro.</Text>
            <View style={{ alignSelf: 'center', width: '35%', marginTop: 25, }}>
              <TextInput
                style={[styles.input, { backgroundColor: '#FFF', }]}
                placeholder='Ingrese su nombre y apellido'
                placeholderTextColor="#888"
                value={name}
                disableFullscreenUI={true}
                onChangeText={(text) => setName(filterName(text))}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 5, marginBottom: 20 }}>
                <TextInput
                  style={{ color: '#000', fontSize: 18, paddingVertical: 10, paddingLeft: 10, }}
                  placeholder='Ingrese un nombre de usuario'
                  placeholderTextColor="#888"
                  value={localUsername}
                  disableFullscreenUI={true}
                  onChangeText={filterUsername}
                  onPressIn={() => setVisible(false)}
                />
                <TouchableOpacity onPress={() => setVisible(!visible)} style={{ marginLeft: 8 }}>
                  <Icon name="question-circle" size={18} color="rgb(80,80,100)" />
                </TouchableOpacity>
                {visible && (
                  <Text style={styles.tooltip}>Longitud mínima de 4 caracteres, se permiten letras, números, guiones y puntos.</Text>
                )}
              </View>
              {error.length > 0 && (
                <View style={{ flexDirection: 'row', marginTop: -15, marginBottom: 20, }}>
                  <Icon3 name="report-gmailerrorred" size={16} color="red" />
                  <Text style={styles.error}>{error}</Text>
                </View>
              )}
              <TouchableOpacity
                style={[styles.button, { alignSelf: 'center', opacity: (name.length > 0 && localUsername.length > 0 && error.length < 1) ? 1 : 0.5 }]}
                disabled={(name.length > 0 && localUsername.length > 0 && error.length < 1) ? false : true}
                onPress={validateRegistration}
              >
                <Icon2 name="file-check" size={22} color="#FFF" />
                <Text style={[styles.textButton, { marginLeft: 2.5 }]}>Finalizar registro</Text>
              </TouchableOpacity>
              {error.length === 50 && (
                <View style={{ flexDirection: 'row', marginTop: 5, }}>
                  <Icon3 name="report-gmailerrorred" size={16} color="red" />
                  <Text style={styles.error}>{error}</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={{ marginTop: 10, }}>
            <Text style={[styles.indication, { textAlign: 'center', marginBottom: 10 }]}>¡Se completó el registro, el segundo paso es activar su cuenta! Siga las siguientes instrucciones para realizar la activación.</Text>
            <Text style={[styles.indication, { textAlign: 'justify', }]}>1. Copie su nombre de usuario (pulse para copiarlo al portapapeles).</Text>
            <Pressable style={styles.infoConteiner} onPress={copyUsername}>
              <Icon4 name="user" size={22} color="#FFF" />
              <Text style={styles.info}>{username}</Text>
            </Pressable>
            <Text style={[styles.indication, { textAlign: 'justify', }]}>2. Envíe el nombre de usuario al siguiente número de WhatsApp (pulse para abrir el chat).</Text>
            <Pressable style={styles.infoConteiner} onPress={openWhatsApp}>
              <Icon name="whatsapp" size={22} color="#FFF" />
              <Text style={styles.info}>(+52) 742 113 2908</Text>
            </Pressable>
            <Text style={[styles.indication, { textAlign: 'justify', }]}>3. Una vez que reciba la indicación de que su cuenta fue activada, pulse el botón para continuar.</Text>
            <View style={{ width: '35%', alignItems: 'center', alignSelf: 'center', marginTop: 5, }}>
              <TouchableOpacity
                style={[styles.button, { opacity: timer > 0 ? 0.5 : 1 }]}
                disabled={timer > 0 ? true : false}
                onPress={validateActivation}
              >
                <Text style={[styles.textButton, { marginRight: 2.5 }]}>Continuar</Text>
                <Icon5 name="enter-outline" size={22} color="#FFF" />
              </TouchableOpacity>
              {error.length > 0 && (
                <View style={{ flexDirection: 'row', marginTop: 5, }}>
                  <Icon3 name="report-gmailerrorred" size={16} color="red" />
                  <Text style={[styles.error, { textAlign: 'center', }]}>{timer > 0 ? `${error} Intente de nuevo en ${timer}s` : `${error} Intente de nuevo`}</Text>
                </View>
              )}
            </View>
          </View>
        )}
        <ModalLoading visible={loading} />
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(16,16,16,0.5)',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '25%',
    //backgroundColor: '#0F0'
  },
  textHeader: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#FFF',
    paddingTop: 20,
    //backgroundColor: '#F0F'
  },
  indication: {
    fontSize: 18,
    color: '#FFF',
    marginHorizontal: 25,
    //backgroundColor: '#00F'
  },
  input: {
    //backgroundColor: '#FFF',
    color: '#000',
    fontSize: 18,
    paddingVertical: 10,
    paddingLeft: 10,
    borderRadius: 5,
    marginBottom: 20
  },
  tooltip: {
    color: '#FFF',
    fontSize: 12,
    textAlign: 'justify',
    borderRadius: 5,
    borderColor: '#FFF',
    borderWidth: 0.5,
    marginLeft: 15,
    padding: 5,
  },
  error: {
    fontSize: 12,
    color: 'red',
    textAlign: 'center',
    borderRadius: 5,
    paddingBottom: 1,
    paddingLeft: 2,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    padding: 10,
    width: '60%',
    backgroundColor: 'rgb(80,80,100)',
  },
  textButton: {
    fontSize: 18,
    color: '#FFF',
    textAlignVertical: 'center',
    paddingBottom: 2
  },
  infoConteiner: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(80,80,100,0.5)',
    marginTop: 5,
    marginBottom: 2,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  info: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 5
  },
});

export default Activation;
