import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, Image, ScrollView, StyleSheet, Pressable, ToastAndroid, Vibration, KeyboardAvoidingView, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon3 from 'react-native-vector-icons/MaterialIcons';
import Icon4 from 'react-native-vector-icons/Feather';
import Icon5 from 'react-native-vector-icons/Ionicons';
import Clipboard from '@react-native-clipboard/clipboard';
import { Linking } from 'react-native';
import { showMessage, hideMessage } from 'react-native-flash-message';
import { useQuery } from '@realm/react';
import { useStreaming } from '../../services/hooks/useStreaming';
import { validarUsername, registrarCliente, verificarCliente, obtenerNotificaciones } from '../../services/controllers/hostingController';
import ModalLoading from '../../components/Modals/modal_loading';

const Activation = ({ navigation, route }) => {
  const isReactivation = route.params.reactivation; // Recupera el valor que indica si es 'reactivación' o 'activación'
  const usuario = useQuery('Usuario');
  const { upsertNotifications, updateUserProps } = useStreaming();
  const [name, setName] = useState(''); // Estado para manejar el nombre ingresado
  const [localUsername, setLocalUsername] = useState(''); // Estado para manejar el nombre de usuario ingresado
  const [visible, setVisible] = useState(false); // Estado para manejar la visibilidad del tooltip
  const [error, setError] = useState(''); // Estado para el manejo de los mensajes de error
  const [isWriting, setIsWriting] = useState(false); // Estado para el manejo de cuando se escriba por primera vez
  const [timer, setTimer] = useState(0); // Estado para manejar el temporizador
  const [loading, setLoading] = useState(false); // Estado para manejar el modal de carga
  const [keyboardPadding, setKeyboardPadding] = useState(0); // Estado para manejar el valor del padding cuando se muestra/oculta el teclado

  const handleStartLoading = () => setLoading(true); //Cambia el valor a verdadero para que se muestre el modal de carga
  const handleFinishLoading = () => setLoading(false); //Cambia el valor a falso para que se cierre el modal de carga

  // Escucha los eventos del Teclado
  useEffect(() => {
    // Define las funciones para cuando el teclado se muestra y se oculta
    const onKeyboardShow = () => setKeyboardPadding('35%'); // Pone el padding
    const onKeyboardHide = () => setKeyboardPadding(0);   // Quita el padding

    // Se suscribe a los eventos
    const showSubscription = Keyboard.addListener('keyboardDidShow', onKeyboardShow);
    const hideSubscription = Keyboard.addListener('keyboardDidHide', onKeyboardHide);

    // Limpia los listeners cuando el componente se desmonta
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Maneja la validación del nombre de usuario (longitud minima y si ya existe)
  useEffect(() => {
    if (!isWriting) return; // Evita validar al principio

    const validateUsername = () => {
      const filtered = localUsername.replace(/[^a-zA-Z0-9_\-.]/g, '');
      if (filtered.length < 4) {
        setError('La longitud mínima es de 4 caracteres');
      } else {
        setError('');
      }
    };

    validateUsername();
  }, [localUsername, isWriting]); // Se ejecuta cada vez que cambia el username

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
    if (error !== '') return; // Si ya hay error de formato, no continua

    setVisible(false); // Cierra el tooltip si está abierto
    handleStartLoading?.(); // Inicia el modal de carga

    // Verifica si el nombre de usuario existe en la Base de Datos de la Nube antes de intentar registrar
    const usernameExists = await validarUsername(localUsername.toLowerCase());

    if (usernameExists) {
      handleFinishLoading?.();
      setError('¡Ya existe ese nombre de usuario! Ingrese uno diferente');
      return; // Detiene el proceso aquí
    }

    const response = await handleRegisterDevice();
    handleFinishLoading?.(); // Termina el modal de carga

    if (response) {
      updateUserProps(usuario[0]?.device_id, {
        client_name: name.trim(),
        username: localUsername,
        is_registered: true,
      });
      setError('');
    } else {
      setError('¡Ocurrió un error en el registro! Intente de nuevo');
    }
  };

  const handleRegisterDevice = async () => {
    const info = {
      device_id: usuario[0]?.device_id,
      client_name: name.trim(),
      username: localUsername,
      username_lower: localUsername.toLowerCase(),
      user: '',
      password: '',
      host: '',
      active: false,
      expiration: '',
      package: '',
      device_model: usuario[0]?.device_model,
      android_version: usuario[0]?.android_version,
    };

    const response = await registrarCliente(info);
    return response;
  };

  const validateActivation = async () => {
    hideMessage();
    handleStartLoading?.(); // Inicia el modal de carga
    const response = await verificarCliente(usuario[0]?.device_id); //Consultamos la información del cliente para verficar su activación
    handleFinishLoading?.(); // Termina el modal de carga

    if (response.numId === 2) { //Si devuelve una respuesta valida...
      const info = response.data;
      if (info.active) { //Si la cuenta ya está activa...
        const notifications = await obtenerNotificaciones(info.id);
        updateUserProps(usuario[0]?.device_id, {
          id: info.id,
          user: info.user,
          password: info.password,
          host: info.host,
          is_active: info.active,
          expiration_date: info.expiration,
          purchased_package: info.package
        });
        upsertNotifications(notifications);
        // Envía 'true' al Menú para forzar la actualización del contenido en caso de que el contador del tiempo falle
        navigation.replace('Menu', { updateNow: true });
      } else { //Si la cuenta no está activa...
        setTimer(60);
        setError('¡Su cuenta está inactiva!');
      }
    } else { // Si no devuelve una respuesta valida...
      setError('¡Error en la verificación! Intente de nuevo');
    }
  };

  const copyInfo = (numId) => {
    let message = '';

    switch (numId) {
      case 1: // Nombre de usuario
        message = usuario[0]?.username;
        break;
      case 2: // Número de tarjeta del proveedor
        message = '4152314370922968';
        break;
      case 3: // Banco del proveedor
        message = 'BBVA';
        break;
      case 4: // Nombre del proveedor
        message = 'Abner Pino Federico';
        break;
      case 5: // Nombre del cliente
        message = usuario[0]?.client_name;
        break;
      default:
        message = '';
        break;
    }

    Clipboard.setString(message); // Copia el mensaje al portapapeles
    ToastAndroid.show('Información copiada al portapapeles!', ToastAndroid.SHORT);
  };

  const openWhatsApp = async () => {
    let number = '+527421132908';
    let message = `${isReactivation ? 'REACTIVACIÓN' : 'ACTIVACIÓN'} DE CUENTA IPTV PLAYER\n\nUsuario: *${usuario[0]?.username}*`;
    let url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

    Linking.openURL(url)
      .catch(() => ToastAndroid.show('No se pudo abrir WhatsApp', ToastAndroid.SHORT));
  };

  const showToast = (mensaje) => {
    Vibration.vibrate();

    showMessage({
      message: mensaje,
      type: 'default',
      duration: 1000,
      position: 'bottom',
      backgroundColor: '#EEE',
      color: '#000',
      style: styles.flashMessage,
    });
  };

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
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1, paddingBottom: keyboardPadding }} keyboardShouldPersistTaps="handled" >
          {/* Encabezado */}
          <View style={[styles.header, { height: isReactivation ? '20%' : '25%' }]}>
            <Text style={styles.textHeader}>{`${isReactivation ? 'BIENVENIDO     A' : 'BIENVENIDO    A'}`}</Text>
            <Image
              source={require('../../assets/imagotipo.png')}
              style={{ height: '100%', width: '26%', resizeMode: 'contain', alignSelf: 'center', }}
            />
          </View>
          {!usuario[0]?.is_registered ? (
            // Registro
            <View style={{ marginTop: 20, }}>
              <Text style={styles.indication}>¡Para comenzar a disfrutar de todo el contenido, el primer paso es registrarse! Llene los campos a continuación y después pulse el botón para finalizar el registro.</Text>
              <View style={{ alignSelf: 'center', width: '32.5%', marginTop: 25, }}>
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
            <View style={{ marginTop: isReactivation ? 0 : 10, }}>
              {isReactivation ? (
                // Reactivación
                <>
                  <Text style={[styles.indication, { textAlign: 'center', marginBottom: 10 }]}>¡Su cuenta se encuentra desactivada! Siga las siguientes instrucciones para reactivarla:</Text>
                  <Text style={[styles.indication, { textAlign: 'justify', }]}>1. Realice el pago correspondiente por transferencia a la siguiente cuenta.</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                    <Pressable style={styles.infoConteiner} onPress={() => copyInfo(2)} onLongPress={() => showToast('Presione para copiar')}>
                      <Icon name="credit-card-alt" size={22} color="#FFF" />
                      <Text style={styles.info}>4152 3143 7092 2968</Text>
                    </Pressable>
                    <Pressable style={styles.infoConteiner} onPress={() => copyInfo(3)} onLongPress={() => showToast('Presione para copiar')}>
                      <Icon name="bank" size={22} color="#FFF" />
                      <Text style={styles.info}>BBVA</Text>
                    </Pressable>
                    <Pressable style={styles.infoConteiner} onPress={() => copyInfo(4)} onLongPress={() => showToast('Presione para copiar')}>
                      <Icon name="vcard" size={22} color="#FFF" />
                      <Text style={styles.info}>Abner Pino Federico</Text>
                    </Pressable>
                  </View>
                  <Text style={[styles.indication, { textAlign: 'justify', }]}>2. En el concepto (o motivo) del pago, escriba su nombre de usuario o su nombre completo.</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                    <Pressable style={styles.infoConteiner} onPress={() => copyInfo(1)} onLongPress={() => showToast('Presione para copiar')}>
                      <Icon4 name="user" size={22} color="#FFF" />
                      <Text style={styles.info}>{usuario[0]?.username}</Text>
                    </Pressable>
                    <Pressable style={styles.infoConteiner} onPress={() => copyInfo(5)} onLongPress={() => showToast('Presione para copiar')}>
                      <Icon name="vcard" size={22} color="#FFF" />
                      <Text style={styles.info}>{usuario[0]?.client_name}</Text>
                    </Pressable>
                  </View>
                  <Text style={[styles.indication, { textAlign: 'justify', }]}>3. Tome captura del comprobante de pago y envíela al siguiente número de WhatsApp:</Text>
                  <Pressable style={styles.infoConteiner} onPress={openWhatsApp} onLongPress={() => showToast('Presione para abrir')}>
                    <Icon name="whatsapp" size={22} color="#FFF" />
                    <Text style={styles.info}>(+52) 742 113 2908</Text>
                  </Pressable>
                  <Text style={[styles.indication, { textAlign: 'justify', }]}>4. Una vez que se le indique que su cuenta fue reactivada, pulse el botón 'Continuar'.</Text>
                </>
              ) : (
                // Activación
                <>
                  <Text style={[styles.indication, { textAlign: 'center', marginBottom: 10 }]}>¡Se completó el registro! El segundo paso es activar su cuenta, siga las siguientes instrucciones para realizar la activación:</Text>
                  <Text style={[styles.indication, { textAlign: 'justify', }]}>1. Copie su nombre de usuario (pulse para copiarlo al portapapeles).</Text>
                  <Pressable style={styles.infoConteiner} onPress={() => copyInfo()} onLongPress={() => showToast('Presione para copiar')}>
                    <Icon4 name="user" size={22} color="#FFF" />
                    <Text style={styles.info}>{usuario[0]?.username}</Text>
                  </Pressable>
                  <Text style={[styles.indication, { textAlign: 'justify', }]}>2. Envíelo al siguiente WhatsApp (pulse para abrir el chat) y siga las indicaciones que se le den.</Text>
                  <Pressable style={styles.infoConteiner} onPress={openWhatsApp} onLongPress={() => showToast('Presione para abrir')}>
                    <Icon name="whatsapp" size={22} color="#FFF" />
                    <Text style={styles.info}>(+52) 742 113 2908</Text>
                  </Pressable>
                  <Text style={[styles.indication, { textAlign: 'justify', }]}>3. Una vez que se le indique que su cuenta fue activada, pulse el botón 'Continuar'.</Text>
                </>
              )}
              {/* Botón y mensaje de error */}
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
        </ScrollView>
      </KeyboardAvoidingView>
      <ModalLoading visible={loading} />
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
  },
  textHeader: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#FFF',
    paddingTop: 15,
  },
  indication: {
    fontSize: 18,
    color: '#FFF',
    marginHorizontal: 25,
    textAlign: 'center'
  },
  input: {
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
  flashMessage: {
    width: '20%',
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'center',
    paddingTop: 2.5,
    paddingBottom: 1,
    marginBottom: '2%',
  },
});

export default Activation;
