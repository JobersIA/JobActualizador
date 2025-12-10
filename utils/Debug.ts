//╔═══════════════════════════════════════════════════════════╗
//║       ██╗ ██████╗ ██████╗ ███████╗██████╗ ███████╗        ║
//║       ██║██╔═══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝        ║
//║       ██║██║   ██║██████╔╝█████╗  ██████╔╝███████╗        ║
//║  ██   ██║██║   ██║██╔══██╗██╔══╝  ██╔══██╗╚════██║        ║
//║  ╚█████╔╝╚██████╔╝██████╔╝███████╗██║  ██║███████║        ║
//║   ╚════╝  ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝        ║
//╚═══════════════════════════════════════════════════════════╝
//10-12-2025: Debug.ts
//Autor: Ramón San Félix Ramón
//Email: rsanfelix@jobers.net
//Teléfono: 626 99 09 26

// Variable global para activar/desactivar logs
export const DEBUG_ENABLED = true;

export const Debug = {
  log: (...args: any[]) => {
    if (DEBUG_ENABLED) {
      console.log('[DEBUG]', ...args);
    }
  },
  error: (...args: any[]) => {
    if (DEBUG_ENABLED) {
      console.error('[ERROR]', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (DEBUG_ENABLED) {
      console.warn('[WARN]', ...args);
    }
  },
  trace: (location: string, message?: string) => {
    if (DEBUG_ENABLED) {
      console.log(`[TRACE] ${location}${message ? ': ' + message : ''}`);
    }
  },
};
