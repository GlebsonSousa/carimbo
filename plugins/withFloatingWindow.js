/**
 * Deixa a janela do app transparente, para a roda aparecer flutuando
 * por cima do app de onde veio o arquivo (Compartilhar / Abrir com).
 * No Android 12+ o app de trás também fica desfocado, quando o aparelho suporta.
 */
const { withAndroidStyles, AndroidConfig } = require('expo/config-plugins');

const ITEMS = {
  'android:windowIsTranslucent': 'true',
  'android:windowBackground': '@android:color/transparent',
  'android:windowNoTitle': 'true',
  'android:backgroundDimEnabled': 'false',
  'android:windowBlurBehindEnabled': 'true',
  'android:windowBlurBehindRadius': '28dp',
};

const THEMES = ['AppTheme', 'Theme.App.SplashScreen'];

module.exports = function withFloatingWindow(config) {
  return withAndroidStyles(config, (cfg) => {
    let styles = cfg.modResults;
    for (const theme of THEMES) {
      for (const [name, value] of Object.entries(ITEMS)) {
        styles = AndroidConfig.Styles.assignStylesValue(styles, {
          add: true,
          parent: { name: theme },
          name,
          value,
        });
      }
    }
    cfg.modResults = styles;
    return cfg;
  });
};
