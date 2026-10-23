import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { bubble } from '../../modules/carimbo-bubble';

/**
 * Estado da bolha flutuante. Se faltar a permissão "exibir sobre outros apps",
 * abre a tela do Android e liga a bolha sozinho quando o usuário voltar com ela concedida.
 */
export function useBubble() {
  const [on, setOn] = useState(() => bubble.isRunning());
  const [askedPermission, setAskedPermission] = useState(false);
  const waiting = useRef(false);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      if (waiting.current && bubble.canDrawOverlays()) {
        waiting.current = false;
        setAskedPermission(false);
        setOn(bubble.start());
      } else {
        setOn(bubble.isRunning());
      }
    });
    return () => sub.remove();
  }, []);

  const toggle = useCallback(() => {
    if (bubble.isRunning()) {
      bubble.stop();
      setOn(false);
      return;
    }
    if (!bubble.canDrawOverlays()) {
      waiting.current = true;
      setAskedPermission(true);
      bubble.openOverlaySettings();
      return;
    }
    setOn(bubble.start());
  }, []);

  return { available: bubble.available, on, askedPermission, toggle };
}
