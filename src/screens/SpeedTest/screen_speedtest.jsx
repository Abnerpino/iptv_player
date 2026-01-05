import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { WebView } from 'react-native-webview';

const SpeedTest = ({ navigation }) => {
  const injectedJS = `
    const hideUnwanted = () => {
      const selectorsToHide = [
        '.language-selector-container',      // Lenguaje y Privacidad
        '.footer-container',                 // Iconos del footer
        '#settings-link',                    // Controles avanzados
      ];

      // Oculta elementos
      selectorsToHide.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) el.style.display = 'none';
      });

      // Deshabilita enlace del logo (logo de Netflix)
      const poweredByLink = document.querySelector('.powered-by-container a');
      if (poweredByLink) {
        poweredByLink.removeAttribute('href');
        poweredByLink.style.pointerEvents = 'none';
      }

      // Desactiva selección de texto
      const style = document.createElement('style');
      style.innerHTML = \`* {
        user-select: none !important;
        -webkit-user-select: none !important;
        -ms-user-select: none !important;
      }\`;
      document.head.appendChild(style);

      // Inserta viewport para bloquear zoom
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);

      // Estilos generales
      document.body.style.overflow = 'hidden';
      document.body.style.backgroundColor = '#fff';
    };

    const observer = new MutationObserver(() => hideUnwanted());
    observer.observe(document.body, { childList: true, subtree: true });

    hideUnwanted();
    true;
  `;

  return (
    <ImageBackground
      source={require('../../assets/fondo3.jpg')}
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
      }}
      resizeMode='cover'
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 15, paddingVertical: 12.5, alignSelf: 'flex-start' }}>
            <Icon name="arrow-circle-left" size={26} color="white" />
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>TEST DE VELOCIDAD</Text>
        </View>
        <WebView
          source={{ uri: 'https://fast.com' }}
          injectedJavaScript={injectedJS}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          originWhitelist={['*']}
          scrollEnabled={false}
          scalesPageToFit={false}
          style={styles.webView}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(16,16,16,0)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  sectionTitle: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  webView: {
    flex: 1,
  },
});

export default SpeedTest;
