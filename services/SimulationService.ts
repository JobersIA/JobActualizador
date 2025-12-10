//╔═══════════════════════════════════════════════════════════╗
//║       ██╗ ██████╗ ██████╗ ███████╗██████╗ ███████╗        ║
//║       ██║██╔═══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝        ║
//║       ██║██║   ██║██████╔╝█████╗  ██████╔╝███████╗        ║
//║  ██   ██║██║   ██║██╔══██╗██╔══╝  ██╔══██╗╚════██║        ║
//║  ╚█████╔╝╚██████╔╝██████╔╝███████╗██║  ██║███████║        ║
//║   ╚════╝  ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝        ║
//╚═══════════════════════════════════════════════════════════╝
//10-12-2025: SimulationService.ts
//Autor: Ramón San Félix Ramón
//Email: rsanfelix@jobers.net
//Teléfono: 626 99 09 26

import Constants from 'expo-constants';
import { Storage, StorageKeys } from '../utils/Storage';

const DEBUG = true;

export interface SimulationState {
  enabled: boolean;
  appVersion: string;
  buildDate: string;
  installCount: number;
  realAppVersion: string;
}

class SimulationService {
  private enabled: boolean = false;
  private appVersion: string = '1.0.0';
  private buildDate: string = '';
  private installCount: number = 0;

  constructor() {
    this.initialize();
  }

  async initialize(): Promise<void> {
    try {
      const enabled = await Storage.getItem(StorageKeys.SIMULATION_ENABLED);
      const version = await Storage.getItem(StorageKeys.SIMULATED_APP_VERSION);
      const date = await Storage.getItem(StorageKeys.SIMULATED_BUILD_DATE);
      const count = await Storage.getItem(StorageKeys.SIMULATION_INSTALL_COUNT);

      this.enabled = enabled === 'true';
      this.appVersion = version || Constants.expoConfig?.version || '1.0.0';
      this.buildDate = date || new Date().toISOString();
      this.installCount = parseInt(count || '0', 10);

      if (DEBUG) {
        console.log('=== SIMULATION SERVICE INITIALIZED ===');
        console.log('Enabled:', this.enabled);
        console.log('Simulated Version:', this.appVersion);
        console.log('Build Date:', this.buildDate);
        console.log('Install Count:', this.installCount);
        console.log('Real App Version:', this.getRealAppVersion());
        console.log('======================================');
      }
    } catch (error: any) {
      if (DEBUG) console.log('Error initializing SimulationService:', error.message);
    }
  }

  getRealAppVersion(): string {
    return Constants.expoConfig?.version || '1.0.0';
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async setEnabled(enabled: boolean): Promise<void> {
    this.enabled = enabled;
    await Storage.setItem(StorageKeys.SIMULATION_ENABLED, enabled ? 'true' : 'false');

    // Si se activa por primera vez, inicializar con la versión real
    if (enabled) {
      const storedVersion = await Storage.getItem(StorageKeys.SIMULATED_APP_VERSION);
      if (!storedVersion) {
        await this.setAppVersion(this.getRealAppVersion());
        await this.setBuildDate(new Date().toISOString());
      }
    }

    if (DEBUG) console.log('Simulation enabled:', enabled);
  }

  getAppVersion(): string {
    if (this.enabled) {
      return this.appVersion;
    }
    return this.getRealAppVersion();
  }

  async setAppVersion(version: string): Promise<void> {
    this.appVersion = version;
    await Storage.setItem(StorageKeys.SIMULATED_APP_VERSION, version);
    if (DEBUG) console.log('Simulated version set to:', version);
  }

  getBuildDate(): string {
    return this.buildDate;
  }

  async setBuildDate(date: string): Promise<void> {
    this.buildDate = date;
    await Storage.setItem(StorageKeys.SIMULATED_BUILD_DATE, date);
    if (DEBUG) console.log('Build date set to:', date);
  }

  getInstallCount(): number {
    return this.installCount;
  }

  async incrementInstallCount(): Promise<number> {
    this.installCount++;
    await Storage.setItem(StorageKeys.SIMULATION_INSTALL_COUNT, this.installCount.toString());
    if (DEBUG) console.log('Install count:', this.installCount);
    return this.installCount;
  }

  /**
   * Simula una instalación exitosa:
   * - Incrementa la versión en 0.0.1
   * - Actualiza la fecha de compilación a hoy
   * - Incrementa el contador de instalaciones
   */
  async simulateSuccessfulInstall(newVersion?: string): Promise<void> {
    if (!this.enabled) {
      if (DEBUG) console.log('Simulation not enabled, skipping install simulation');
      return;
    }

    // Calcular nueva versión si no se proporciona
    if (!newVersion) {
      newVersion = this.incrementVersion(this.appVersion);
    }

    await this.setAppVersion(newVersion);
    await this.setBuildDate(new Date().toISOString());
    await this.incrementInstallCount();

    if (DEBUG) {
      console.log('=== SIMULATED INSTALL ===');
      console.log('New Version:', newVersion);
      console.log('Build Date:', this.buildDate);
      console.log('Total Installs:', this.installCount);
      console.log('=========================');
    }
  }

  /**
   * Incrementa la versión en el último dígito
   * 1.0.0 -> 1.0.1, 1.2.9 -> 1.2.10
   */
  private incrementVersion(version: string): string {
    const parts = version.split('.').map(Number);
    if (parts.length >= 3) {
      parts[2]++;
    } else if (parts.length === 2) {
      parts.push(1);
    } else {
      parts.push(0, 1);
    }
    return parts.join('.');
  }

  /**
   * Resetea la simulación a los valores iniciales
   */
  async reset(): Promise<void> {
    const realVersion = this.getRealAppVersion();
    await this.setAppVersion(realVersion);
    await this.setBuildDate(new Date().toISOString());
    this.installCount = 0;
    await Storage.setItem(StorageKeys.SIMULATION_INSTALL_COUNT, '0');

    if (DEBUG) {
      console.log('=== SIMULATION RESET ===');
      console.log('Version reset to:', realVersion);
      console.log('========================');
    }
  }

  /**
   * Obtiene el estado actual de la simulación
   */
  async getState(): Promise<SimulationState> {
    await this.initialize(); // Asegurar que tenemos los últimos valores
    return {
      enabled: this.enabled,
      appVersion: this.appVersion,
      buildDate: this.buildDate,
      installCount: this.installCount,
      realAppVersion: this.getRealAppVersion(),
    };
  }
}

export default new SimulationService();
