import { requireOptionalNativeModule } from 'expo';

interface CarimboBubbleNative {
  canDrawOverlays(): boolean;
  openOverlaySettings(): void;
  start(): boolean;
  stop(): void;
  isRunning(): boolean;
}

/** Módulo nativo da bolha flutuante. Fica null fora do Android (testes, web). */
const native = requireOptionalNativeModule<CarimboBubbleNative>('CarimboBubble');

export const bubble = {
  available: native != null,
  canDrawOverlays: () => native?.canDrawOverlays() ?? false,
  openOverlaySettings: () => native?.openOverlaySettings(),
  start: () => native?.start() ?? false,
  stop: () => native?.stop(),
  isRunning: () => native?.isRunning() ?? false,
};
