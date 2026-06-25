import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TextInput, TouchableNativeFeedback, ImageBackground, Image, ScrollView, StyleSheet, Pressable, Vibration, KeyboardAvoidingView, Keyboard, BackHandler, Platform, findNodeHandle, useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon3 from 'react-native-vector-icons/MaterialIcons';
import Icon4 from 'react-native-vector-icons/Feather';
import Icon5 from 'react-native-vector-icons/Ionicons';
import Clipboard from '@react-native-clipboard/clipboard';
import { Dropdown } from 'react-native-element-dropdown';
import { Linking } from 'react-native';
import { showMessage, hideMessage } from 'react-native-flash-message';
import { useQuery } from '@realm/react';
import { getCrashlytics, log } from '@react-native-firebase/crashlytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNExitApp from 'react-native-exit-app';
import { useStreaming } from '../../services/hooks/useStreaming';
import { actualizarCliente, validarUsername, registrarCliente, verificarCliente, agregarClienteANotificaciones, obtenerNotificaciones } from '../../services/controllers/hostingController';
import ModalLoading from '../../components/Modals/modal_loading';
import RippleButton from '../../components/RippleButton/ripple_button';
import ItemDropdown from '../../components/Items/item_dropdown';

const Activation = ({ navigation, route }) => {
  const isReactivation = route.params.reactivation; // Recupera el valor que indica si es 'reactivación' o 'activación'
  const usuario = useQuery('Usuario');
  const { upsertNotifications, updateUserProps, getResellers } = useStreaming();
  const { width, height } = useWindowDimensions();
  const resellers = getResellers();
  const [isRegistered, setIsRegistered] = useState(usuario[0]?.is_registered || false); // Estado local para saber cuando el usuario esté registrado
  const [name, setName] = useState(''); // Estado para manejar el nombre ingresado
  const [localUsername, setLocalUsername] = useState(''); // Estado para manejar el nombre de usuario ingresado
  const [error, setError] = useState(''); // Estado para el manejo de los mensajes de error
  const [isWriting, setIsWriting] = useState(false); // Estado para el manejo de cuando se escriba por primera vez
  const [timer, setTimer] = useState(0); // Estado para manejar el temporizador
  const [loading, setLoading] = useState(false); // Estado para manejar el modal de carga
  const [keyboardPadding, setKeyboardPadding] = useState(0); // Estado para manejar el valor del padding cuando se muestra/oculta el teclado
  const [selectedReseller, setSelectedReseller] = useState(resellers[0]); // Estado para manejar el reseller seleccionado
  const [focusTags, setFocusTags] = useState({ back: null, wrapperName: null, wrapperUser: null, info: null, register: null, dropAct: null, dropReact: null, continue: null }); // Estado para manejar las etiquetas de los botones para la navegación
  const [focusedTag, setFocusedTag] = useState(null); // Estado para saber a cuál etiqueta apuntar automaticamenté al cerrar Input o DropDown
  const handleStartLoading = () => setLoading(true); //Cambia el valor a verdadero para que se muestre el modal de carga
  const handleFinishLoading = () => setLoading(false); //Cambia el valor a falso para que se cierre el modal de carga
  const backBtnRef = useRef(null); // Referencia para el botón de Regresar
  const nameWrapperRef = useRef(null); // Referencia para wrapper del input del nombre
  const userWrapperRef = useRef(null); // Referencia para el wrapper del input del usuario
  const nameInputRef = useRef(null); // Referencia para el Input del nombre
  const userInputRef = useRef(null); // Referencia para el Input del usuario
  const infoBtnRef = useRef(null); // Referencia para botón de Información
  const registerBtnRef = useRef(null); // Referencia para el botón de Registro
  const dropActWrapperRef = useRef(null); // Referencia para el wrapper del DropDown de la pantalla Activación
  const activationDropdowndRef = useRef(null); // Referencia para el DropDown de la pantalla Activación
  const dropReactWrapperRef = useRef(null); // Referencia para wrapper del DropDown de la pantalla Reactivación
  const reactivationDropdowndRef = useRef(null); // Referencia para el DropDown de la pantalla Reactivación
  const continueBtnRef = useRef(null); // Referencia para el botón de Continuar

  const focusRipple = Platform.isTV ? TouchableNativeFeedback.Ripple('#FFD700', false) : TouchableNativeFeedback.Ripple('#FFFFFF40', false);
  // Evalua de forma estricta qué pantalla se está mostrando actualmente
  const currentScreenState = !isRegistered ? 'registro' : (isReactivation ? 'reactivacion' : 'activacion');

  // Se ejecuta cada vez que la pantalla Activation está enfocada
  useFocusEffect(
    useCallback(() => {
      const crashlytics = getCrashlytics(); // Obtiene la instancia de Crashlytics
      log(crashlytics, `Activation (${currentScreenState})`); // Establece el mensaje
    }, [isRegistered, isReactivation]) // Se reejecuta cada vez que cambian la dependencias
  );

  // useEffect para vincular los botones para navegación explicita
  useEffect(() => {
    // Si no es TV, no hace nada
    if (!Platform.isTV) return;

    let timeoutId;
    let intentos = 0;
    const maxIntentos = 15; // Intentará hasta por 1.5 segundos (15 * 100ms)

    const mapearNodos = () => {
      // Intenta capturar los IDs nativos
      let tags = {
        back: backBtnRef.current ? findNodeHandle(backBtnRef.current) : null,
        wrapperName: nameWrapperRef.current ? findNodeHandle(nameWrapperRef.current) : null,
        wrapperUser: userWrapperRef.current ? findNodeHandle(userWrapperRef.current) : null,
        info: infoBtnRef.current ? findNodeHandle(infoBtnRef.current) : null,
        register: registerBtnRef.current ? findNodeHandle(registerBtnRef.current) : null,
        dropAct: dropActWrapperRef.current ? findNodeHandle(dropActWrapperRef.current) : null,
        dropReact: dropReactWrapperRef.current ? findNodeHandle(dropReactWrapperRef.current) : null,
        continue: continueBtnRef.current ? findNodeHandle(continueBtnRef.current) : null,
      };

      // Valída los nodos según la vista en la que se encuentre el usuario
      const registroListo = currentScreenState === 'registro' && tags.wrapperName && tags.wrapperUser && tags.info && tags.register;
      const activacionLista = currentScreenState === 'activacion' && !isReactivation && tags.dropAct && tags.continue;
      const reactivacionLista = currentScreenState === 'reactivacion' && isReactivation && tags.dropReact && tags.continue;

      // Si la vista actual ya pintó sus nodos en Android o se acabaron los intentos...
      if (registroListo || activacionLista || reactivacionLista || intentos >= maxIntentos) {
        setFocusTags(tags); // Guarda las etiquetas de los nodos
      } else { // Si los nodos siguen siendo null...
        // Espera 100ms y vuelve a intentarlo
        intentos++;
        timeoutId = setTimeout(mapearNodos, 100);
      }
    };

    // Arranca el primer intento rápido (50ms)
    timeoutId = setTimeout(mapearNodos, 50);

    // Limpieza al desmontar o cambiar de vista
    return () => clearTimeout(timeoutId);
  }, [isRegistered, isReactivation]);

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

  // Maneja la acción del botón de 'Regresar' de Android
  useEffect(() => {
    const backAction = () => {
      handleBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove();
  }, []);

  // Función para cerrar la aplicación
  const handleBack = () => {
    RNExitApp.exitApp();
  };

  // Función para filtrar caracteres especiales y numeros en el nombre
  const filterName = (name) => {
    return name.replace(/[^a-zA-Z ]/g, ''); // Reemplaza todo lo que no sea letra o espacios por vacío
  };

  // Función para filtrar caracteres especiales en el nombre de usuario
  const filterUsername = (input) => {
    if (!isWriting) setIsWriting(true); // Marca que el usuario ya escribió en el input

    const filtered = input.replace(/[^a-zA-Z0-9_\-.]/g, ''); // Reemplaza todo lo que no sea letra o espacios o guiones o puntos, por vacío
    setLocalUsername(filtered); // Solo se actualiza, la validación ahora está en el useEffect
  };

  // Función para validar el registro
  const validateRegistration = async () => {
    if (name.length < 1 || localUsername.length < 1 || error.length > 0) return; // Si algún campo está vacío o hay un error de formato, no continua

    hideMessage(); // Oculta el mensaje de notificación si se está mostrando
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
      setIsRegistered(true);
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
      reactivation: false,
      force_update: false,
      fcm_token: usuario[0]?.fcm_token,
      expiration: '',
      package: '',
      device_model: usuario[0]?.device_model,
      android_version: usuario[0]?.android_version,
    };

    const response = await registrarCliente(info);
    return response;
  };

  const validateActivation = async () => {
    if (timer > 0) return; // Si el temporizador está activo, no hace nada

    hideMessage();
    handleStartLoading?.(); // Inicia el modal de carga

    try {
      const response = await verificarCliente(usuario[0]?.device_id, true); //Consulta la información del cliente para verficar su activación

      if (response.numId === 2) { //Si devuelve una respuesta valida...
        const info = response.data;
        if (info.active) { //Si la cuenta ya está activa...
          await AsyncStorage.setItem('is_active', 'is_active'); // Establece el usuario como activado
          await agregarClienteANotificaciones('initial', info.id); // Agrega en la nube el id del cliente a todas las notificaciones iniciales
          const notifications = await obtenerNotificaciones(info.id, 'initial'); // Obtiene todas las notificaciones iniciales
          updateUserProps(usuario[0]?.device_id, {
            id: info.id,
            user: info.user,
            password: info.password,
            host: info.host,
            expiration_date: info.expiration,
            purchased_package: info.package
          });
          upsertNotifications(notifications);
          actualizarCliente(info.id, { reactivation: true }); // Marca la reactivación como verdadera para la siguiente consulta en la nube
          // Envía 'true' al Menú para forzar la actualización del contenido en caso de que el contador del tiempo falle
          navigation.replace('Menu', { updateNow: true });
        } else { //Si la cuenta no está activa...
          setTimer(60);
          setError('¡Su cuenta está inactiva!');
        }
      } else { // Si no devuelve una respuesta valida...
        setError('¡Error en la verificación! Intente de nuevo');
      }
    } finally {
      handleFinishLoading?.(); // Termina el modal de carga
    }
  };

  const copyInfo = (numId) => {
    let message = '';

    switch (numId) {
      case 1: // Nombre de usuario
        message = usuario[0]?.username;
        break;
      case 2: // Número de tarjeta del proveedor
        message = selectedReseller?.number_card;
        break;
      case 3: // Banco del proveedor
        message = selectedReseller?.bank;
        break;
      case 4: // Nombre del proveedor
        message = selectedReseller?.name;
        break;
      case 5: // Nombre del cliente
        message = usuario[0]?.client_name;
        break;
      default:
        message = '';
        break;
    }

    Clipboard.setString(message); // Copia el mensaje al portapapeles
    showToast(2, '¡Información copiada al portapapeles!');
  };

  const getWhatsApp = () => {
    const code = selectedReseller?.country_code;
    const number = selectedReseller?.whatsapp;
    const formatedNumber = number?.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    const whatsapp = `(+${code}) ${formatedNumber}`;
    return whatsapp;
  };

  const openWhatsApp = async () => {
    let number = `+${selectedReseller?.country_code}${selectedReseller?.whatsapp}`;
    let message = `${isReactivation ? 'REACTIVACIÓN' : 'ACTIVACIÓN'} DE CUENTA IPTV PLAYER\n\nUsuario: *${usuario[0]?.username}*`;
    let url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

    Linking.openURL(url)
      .catch(() => showToast(2, 'No se pudo abrir WhatsApp'));
  };

  const showToast = (numId, mensaje) => {
    if (numId > 2) {
      Vibration.vibrate();
    }

    showMessage({
      message: mensaje,
      type: 'default',
      duration: numId === 1 ? 5000 : 1000,
      position: 'bottom',
      backgroundColor: '#EEE',
      color: '#000',
      style: [styles.flashMessage, { width: numId === 1 ? '75%' : numId === 2 ? '30.5%' : '20%' }],
    });
  };

  return (
    <ImageBackground
      source={require('../../assets/fondo.jpg')}
      style={styles.imageBackground}
      resizeMode='cover'
    >
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ flexGrow: 1, padding: height * 0.0463, paddingBottom: keyboardPadding, }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Encabezado */}
          <RippleButton
            ref={backBtnRef}
            mainStyle={{ position: 'absolute', top: height * (isReactivation ? 0.13 : 0.16), left: width * 0.05, zIndex: 99 }}
            iconLib={Icon}
            name="arrow-circle-left"
            onPress={handleBack}
            onLongPress={() => showToast(3, 'Salir de la App')}
            nextFocusUp={focusTags.back}
            nextFocusLeft={focusTags.back}
            nextFocusRight={focusTags.back}
            nextFocusDown={focusTags.wrapperName || focusTags.dropAct || focusTags.dropReact || focusTags.continue}
          />
          <View style={{ justifyContent: 'center', height: height * (isReactivation ? 0.20 : 0.25) }}>
            <Image
              source={require('../../assets/imagotipo_welcome.png')}
              style={{ height: '100%', width: '50%', resizeMode: 'contain', alignSelf: 'center', }}
            />
          </View>
          {!isRegistered ? (
            // Registro
            <View style={{ marginTop: height * 0.0463 }}>
              <Text style={[styles.indication, { marginHorizontal: width * 0.0288 }]}>
                ¡Para comenzar a disfrutar de todo el contenido, el primer paso es registrarse! Llene los campos a continuación y después pulse el botón para finalizar el registro.
              </Text>
              <View style={{ alignSelf: 'center', marginTop: height * 0.0579, }}>
                <View style={[styles.wrapper, { marginBottom: height * 0.0463 }]}>
                  <TouchableNativeFeedback
                    ref={nameWrapperRef}
                    onPress={() => nameInputRef.current?.focus()}
                    background={focusRipple}
                    useForeground={!Platform.isTV}
                    hasTVPreferredFocus={Platform.isTV && !focusedTag}
                    nextFocusUp={focusTags.back}
                    nextFocusLeft={focusTags.wrapperName}
                    nextFocusRight={focusTags.wrapperName}
                    nextFocusDown={focusTags.wrapperUser}
                  >
                    <View style={styles.borderSimulator}>
                      <View style={styles.innerContent}>
                        <TextInput
                          ref={nameInputRef}
                          style={[styles.input, { height: '100%', padding: height * 0.0232, borderRadius: 3, backgroundColor: '#FFF' }]}
                          placeholder='Ingrese su nombre y apellido'
                          placeholderTextColor="#888"
                          value={name}
                          disableFullscreenUI={true}
                          onChangeText={(text) => setName(filterName(text))}
                          onPressIn={() => hideMessage()}
                          onSubmitEditing={() => setFocusedTag(focusTags.wrapperUser)}
                          maxLength={24}
                        />
                      </View>
                    </View>
                  </TouchableNativeFeedback>
                </View>
                <View style={[styles.wrapper, { marginBottom: height * 0.0463 }]}>
                  <TouchableNativeFeedback
                    ref={userWrapperRef}
                    onPress={() => userInputRef.current?.focus()}
                    background={focusRipple}
                    useForeground={!Platform.isTV}
                    hasTVPreferredFocus={Platform.isTV && focusedTag && focusTags.wrapperUser === focusedTag}
                    nextFocusUp={focusTags.wrapperName}
                    nextFocusLeft={focusTags.wrapperUser}
                    nextFocusRight={focusTags.info}
                    nextFocusDown={focusTags.register}
                  >
                    <View style={styles.borderSimulator}>
                      <View style={styles.innerContent}>
                        <View style={styles.inputContent}>
                          <TextInput
                            ref={userInputRef}
                            style={[styles.input, { padding: height * 0.0232 }]}
                            placeholder='Ingrese un nombre de usuario'
                            placeholderTextColor="#888"
                            value={localUsername}
                            disableFullscreenUI={true}
                            onChangeText={filterUsername}
                            onPressIn={() => hideMessage()}
                            onSubmitEditing={() => setFocusedTag(focusTags.register)}
                            maxLength={12}
                          />
                          <RippleButton
                            ref={infoBtnRef}
                            mainStyle={{ marginLeft: '1%' }}
                            iconLib={Icon}
                            name="question-circle"
                            size={18}
                            color="rgb(80,80,100)"
                            onPress={() => showToast(1, 'Longitud mínima de 4 caracteres y máxima de 12, se permiten letras, números, guiones y puntos.')}
                            nextFocusUp={focusTags.wrapperName}
                            nextFocusLeft={focusTags.wrapperUser}
                            nextFocusRight={focusTags.info}
                            nextFocusDown={focusTags.register}
                          />
                        </View>
                      </View>
                    </View>
                  </TouchableNativeFeedback>
                </View>
              </View>
              <View style={{ alignItems: 'center' }}>
                {error.length > 0 && (
                  <View style={{ flexDirection: 'row', marginTop: -(height * 0.0348), marginBottom: height * 0.0463 }}>
                    <Icon3 name="report-gmailerrorred" size={16} color="red" />
                    <Text style={styles.error}>{error}</Text>
                  </View>
                )}
                <View style={styles.buttonWrapper}>
                  <TouchableNativeFeedback
                    ref={registerBtnRef}
                    onPress={validateRegistration}
                    background={focusRipple}
                    useForeground={!Platform.isTV}
                    hasTVPreferredFocus={Platform.isTV && focusedTag && focusTags.register === focusedTag}
                    nextFocusUp={focusTags.wrapperUser}
                    nextFocusLeft={focusTags.register}
                    nextFocusRight={focusTags.register}
                    nextFocusDown={focusTags.register}
                  >
                    <View style={{ padding: Platform.isTV ? 3 : 0 }}>
                      <View style={styles.innerContentButton}>
                        <View style={[styles.button, { alignSelf: 'center', opacity: (name.length > 0 && localUsername.length > 0 && error.length < 1) ? 1 : 0.5, padding: height * 0.0232 }]}>
                          <Icon2 name="file-check" size={22} color="#FFF" />
                          <Text style={[styles.textButton, { marginLeft: 2.5 }]}>Finalizar registro</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableNativeFeedback>
                </View>
                {error.length === 50 && (
                  <View style={{ flexDirection: 'row', marginTop: 5, }}>
                    <Icon3 name="report-gmailerrorred" size={16} color="red" />
                    <Text style={styles.error}>{error}</Text>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View style={{ marginTop: isReactivation ? 0 : height * 0.0232, }}>
              {isReactivation ? (
                // Reactivación
                <>
                  <Text style={[styles.indication, { textAlign: 'center', marginHorizontal: width * 0.0288, marginBottom: height * 0.0232 }]}>
                    ¡Su cuenta se encuentra desactivada! Siga las siguientes instrucciones para reactivarla:
                  </Text>
                  <Text style={[styles.indication, { textAlign: 'justify', marginHorizontal: width * 0.0288 }]}>
                    1. Realice el pago correspondiente por transferencia a {resellers.length > 1 ? 'una de las siguientes cuentas' : 'la siguiente cuenta'}.
                  </Text>
                  <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-evenly', marginTop: 5, marginBottom: 2 }}>
                    <Pressable
                      style={[styles.infoConteiner, { paddingHorizontal: width * 0.0115, marginTop: 0, marginBottom: 0 }]}
                      onPress={() => copyInfo(2)}
                      onLongPress={() => showToast(3, 'Presione para copiar')}
                    >
                      <Icon name="credit-card-alt" size={22} color="#FFF" />
                      <Text style={styles.info}>{selectedReseller?.number_card.match(/.{1,4}/g).join(" ")}</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.infoConteiner, { paddingHorizontal: width * 0.0115, marginTop: 0, marginBottom: 0 }]}
                      onPress={() => copyInfo(3)}
                      onLongPress={() => showToast(3, 'Presione para copiar')}
                    >
                      <Icon name="bank" size={22} color="#FFF" />
                      <Text style={styles.info}>{selectedReseller?.bank}</Text>
                    </Pressable>
                    {resellers.length > 1 ? (
                      <View style={{ borderRadius: 7.5, overflow: 'hidden' }}>
                        <TouchableNativeFeedback
                          ref={dropReactWrapperRef}
                          onPress={() => reactivationDropdowndRef.current?.open()}
                          background={focusRipple}
                          useForeground={!Platform.isTV}
                          hasTVPreferredFocus={Platform.isTV}
                          nextFocusUp={focusTags.back}
                          nextFocusRight={focusTags.dropReact}
                          nextFocusLeft={focusTags.dropReact}
                          nextFocusDown={focusTags.continue}
                        >
                          <View style={{ padding: Platform.isTV ? 3 : 0 }}>
                            <View style={{ flex: 1, borderRadius: 7.5 }}>
                              <Dropdown
                                ref={reactivationDropdowndRef}
                                style={[styles.dropdown, { width: width * (width > 700 ? 0.30 : 0.35), paddingHorizontal: width * 0.0115 }]}
                                selectedTextStyle={styles.info}
                                selectedTextProps={{ numberOfLines: 1 }}
                                containerStyle={{ borderRadius: 5 }}
                                data={resellers}
                                labelField="name"
                                valueField="id"
                                placeholder='Selecciona un Reseller'
                                value={selectedReseller?.id}
                                renderLeftIcon={() => (
                                  <Icon name="vcard" size={22} color="#FFF" />
                                )}
                                renderItem={(item) => (
                                  <ItemDropdown
                                    item={item}
                                    isSelected={selectedReseller?.id === item.id}
                                    onSelect={(selectedItem) => {
                                      setSelectedReseller(selectedItem);
                                      reactivationDropdowndRef.current?.close();
                                      setFocusedTag(focusTags.continue)
                                    }}
                                  />
                                )}
                              />
                            </View>
                          </View>
                        </TouchableNativeFeedback>
                      </View>
                    ) : (
                      <Pressable
                        style={[styles.infoConteiner, { paddingHorizontal: width * 0.0115 }]}
                        onPress={() => copyInfo(4)}
                        onLongPress={() => showToast(3, 'Presione para copiar')}
                      >
                        <Icon name="vcard" size={22} color="#FFF" />
                        <Text style={styles.info}>{selectedReseller?.name}</Text>
                      </Pressable>
                    )}
                  </View>
                  <Text style={[styles.indication, { textAlign: 'justify', marginHorizontal: width * 0.0288 }]}>
                    2. En el concepto (o motivo) del pago, escriba su nombre de usuario o su nombre completo.
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                    <Pressable
                      style={[styles.infoConteiner, { paddingHorizontal: width * 0.0115 }]}
                      onPress={() => copyInfo(1)}
                      onLongPress={() => showToast(3, 'Presione para copiar')}
                    >
                      <Icon4 name="user" size={22} color="#FFF" />
                      <Text style={styles.info}>{usuario[0]?.username}</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.infoConteiner, { paddingHorizontal: width * 0.0115 }]}
                      onPress={() => copyInfo(5)}
                      onLongPress={() => showToast(3, 'Presione para copiar')}
                    >
                      <Icon name="vcard" size={22} color="#FFF" />
                      <Text style={styles.info}>{usuario[0]?.client_name}</Text>
                    </Pressable>
                  </View>
                  <Text style={[styles.indication, { textAlign: 'justify', marginHorizontal: width * 0.0288 }]}>
                    3. Tome captura del comprobante de pago y envíela al siguiente número de WhatsApp:
                  </Text>
                  <Pressable
                    style={[styles.infoConteiner, { paddingHorizontal: width * 0.0115 }]}
                    onPress={openWhatsApp}
                    onLongPress={() => showToast(3, 'Presione para abrir')}
                  >
                    <Icon name="whatsapp" size={22} color="#FFF" />
                    <Text style={styles.info}>{getWhatsApp()}</Text>
                  </Pressable>
                  <Text style={[styles.indication, { textAlign: 'justify', marginHorizontal: width * 0.0288 }]}>
                    4. Una vez que se le indique que su cuenta fue reactivada, pulse el botón 'Continuar'.
                  </Text>
                </>
              ) : (
                // Activación
                <>
                  <Text style={[styles.indication, { textAlign: 'center', marginHorizontal: width * 0.0288, marginBottom: height * 0.0232 }]}>
                    ¡Se completó el registro! El segundo paso es activar su cuenta, siga las siguientes instrucciones para realizar la activación:
                  </Text>
                  <Text style={[styles.indication, { textAlign: 'justify', marginHorizontal: width * 0.0288 }]}>
                    1. {Platform.isTV ? 'Revise y anote su nombre de usuario' : 'Copie su nombre de usuario (pulse para copiarlo al portapapeles)'}.
                  </Text>
                  <Pressable
                    style={[styles.infoConteiner, { paddingHorizontal: width * 0.0115 }]}
                    onPress={() => copyInfo()}
                    onLongPress={() => showToast(3, 'Presione para copiar')}
                  >
                    <Icon4 name="user" size={22} color="#FFF" />
                    <Text style={styles.info}>{usuario[0]?.username}</Text>
                  </Pressable>
                  <Text style={[styles.indication, { textAlign: 'justify', marginHorizontal: width * 0.0288 }]}>
                    2. Envíelo {resellers.length > 1 ? 'a uno de los siguientes números de' : 'al siguiente número de'} WhatsApp{!Platform.isTV && ' (pulse para abrir el chat)'} y siga las indicaciones que se le den.
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 5, marginBottom: 2 }}>
                    {resellers.length > 1 ? (
                      <View style={{ borderRadius: 7.5, overflow: 'hidden' }}>
                        <TouchableNativeFeedback
                          ref={dropActWrapperRef}
                          onPress={() => activationDropdowndRef.current?.open()}
                          background={focusRipple}
                          useForeground={!Platform.isTV}
                          hasTVPreferredFocus={Platform.isTV}
                          nextFocusUp={focusTags.back}
                          nextFocusRight={focusTags.dropAct}
                          nextFocusLeft={focusTags.dropAct}
                          nextFocusDown={focusTags.continue}
                        >
                          <View style={{ padding: Platform.isTV ? 3 : 0 }}>
                            <View style={{ flex: 1, borderRadius: 7.5 }}>
                              <Dropdown
                                ref={activationDropdowndRef}
                                style={[styles.dropdown, { width: width * (width > 700 ? 0.30 : 0.35), paddingHorizontal: width * 0.0115 }]}
                                selectedTextStyle={styles.info}
                                selectedTextProps={{ numberOfLines: 1 }}
                                containerStyle={{ borderRadius: 5 }}
                                data={resellers}
                                labelField="name"
                                valueField="id"
                                placeholder='Selecciona un Reseller'
                                value={selectedReseller?.id}
                                renderLeftIcon={() => (
                                  <Icon name="vcard" size={22} color="#FFF" />
                                )}
                                renderItem={(item) => (
                                  <ItemDropdown
                                    item={item}
                                    isSelected={selectedReseller?.id === item.id}
                                    onSelect={(selectedItem) => {
                                      setSelectedReseller(selectedItem);
                                      activationDropdowndRef.current?.close();
                                      setFocusedTag(focusTags.continue)
                                    }}
                                  />
                                )}
                              />
                            </View>
                          </View>
                        </TouchableNativeFeedback>
                      </View>
                    ) : (
                      <Pressable
                        style={[styles.infoConteiner, { paddingHorizontal: width * 0.0115 }]}
                        onPress={() => copyInfo(4)}
                        onLongPress={() => showToast(3, 'Presione para copiar')}
                      >
                        <Icon name="vcard" size={22} color="#FFF" />
                        <Text style={styles.info}>{selectedReseller?.name}</Text>
                      </Pressable>
                    )}
                    <Pressable
                      style={[styles.infoConteiner, { paddingHorizontal: width * 0.0115, marginTop: 0, marginBottom: 0 }]}
                      onPress={openWhatsApp}
                      onLongPress={() => showToast(3, 'Presione para abrir')}
                    >
                      <Icon name="whatsapp" size={22} color="#FFF" />
                      <Text style={styles.info}>{getWhatsApp()}</Text>
                    </Pressable>
                  </View>
                  <Text style={[styles.indication, { textAlign: 'justify', marginHorizontal: width * 0.0288 }]}>
                    3. Una vez que se le indique que su cuenta fue activada, pulse el botón 'Continuar'.
                  </Text>
                </>
              )}
              {/* Botón y mensaje de error */}
              <View style={{ width: width * 0.35, alignItems: 'center', alignSelf: 'center', marginTop: 5 }}>
                <View style={styles.buttonWrapper}>
                  <TouchableNativeFeedback
                    ref={continueBtnRef}
                    onPress={validateActivation}
                    background={focusRipple}
                    useForeground={!Platform.isTV}
                    hasTVPreferredFocus={Platform.isTV && (resellers.length < 2 || (focusedTag && focusedTag === focusTags.continue))}
                    nextFocusUp={focusTags.dropAct || focusTags.dropReact || focusTags.back}
                    nextFocusRight={focusTags.continue}
                    nextFocusLeft={focusTags.continue}
                    nextFocusDown={focusTags.continue}
                  >
                    <View style={{ padding: Platform.isTV ? 3 : 0 }}>
                      <View style={styles.innerContentButton}>
                        <View style={[styles.button, { opacity: timer > 0 ? 0.5 : 1, padding: height * 0.0232 }]}>
                          <Text style={[styles.textButton, { marginRight: 2.5 }]}>Continuar</Text>
                          <Icon5 name="enter-outline" size={22} color="#FFF" />
                        </View>
                      </View>
                    </View>
                  </TouchableNativeFeedback>
                </View>
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
  imageBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(16,16,16,0.5)',
  },
  indication: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center'
  },
  wrapper: {
    borderRadius: 5,
    overflow: 'hidden',
    height: Platform.isTV ? 55 : 50,
  },
  borderSimulator: {
    flex: 1,
    padding: Platform.isTV ? 3 : 0,
  },
  innerContent: {
    flex: 1,
    borderRadius: 3
  },
  inputContent: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 3,
    backgroundColor: '#FFF'
  },
  input: {
    color: '#000',
    fontSize: 18,
  },
  error: {
    fontSize: 12,
    color: 'red',
    textAlign: 'center',
    borderRadius: 5,
    paddingBottom: 1,
    paddingLeft: 2,
  },
  buttonWrapper: {
    borderRadius: 5,
    overflow: 'hidden'
  },
  innerContentButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
    backgroundColor: 'rgb(80,80,100)',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
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
    paddingVertical: 5,
    borderRadius: 5,
  },
  dropdown: {
    height: 35,
    borderRadius: 7.5,
    backgroundColor: 'rgba(80,80,100,0.5)'
  },
  info: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 5
  },
  flashMessage: {
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'center',
    paddingTop: 2.5,
    paddingBottom: 1,
    marginBottom: '1%',
  },
});

export default Activation;
