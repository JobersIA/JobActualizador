//╔═══════════════════════════════════════════════════════════╗
//║       ██╗ ██████╗ ██████╗ ███████╗██████╗ ███████╗        ║
//║       ██║██╔═══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝        ║
//║       ██║██║   ██║██████╔╝█████╗  ██████╔╝███████╗        ║
//║  ██   ██║██║   ██║██╔══██╗██╔══╝  ██╔══██╗╚════██║        ║
//║  ╚█████╔╝╚██████╔╝██████╔╝███████╗██║  ██║███████║        ║
//║   ╚════╝  ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝        ║
//╚═══════════════════════════════════════════════════════════╝
//10-12-2025: ApiManagerService.ts
//Autor: Ramón San Félix Ramón
//Email: rsanfelix@jobers.net
//Teléfono: 626 99 09 26

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Constants from 'expo-constants';
import { Storage, StorageKeys } from '../utils/Storage';
import SimulationService from './SimulationService';
import { ApiVersionInfo } from '../types';

const DEBUG = true;
const REQUIRED_API_VERSION = '1.0.0';

class ApiManagerService {
  private apiUrl: string = '';
  private axiosInstance: AxiosInstance | null = null;

  constructor() {
    this.initialize();
  }

  async initialize(): Promise<void> {
    try {
      const storedApiUrl = await Storage.getItem(StorageKeys.API_ENDPOINT);
      this.apiUrl = storedApiUrl || 'http://localhost:5000/api';

      // Usar versión simulada si está habilitada
      const appVersion = SimulationService.getAppVersion();

      this.axiosInstance = axios.create({
        baseURL: this.apiUrl,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Accept': 'application/json',
          'X-App-Version': appVersion
        },
        timeout: 15000
      });

      if (DEBUG) {
        console.log('ApiManager initialized with URL:', this.apiUrl);
        console.log('X-App-Version header:', appVersion);
        if (SimulationService.isEnabled()) {
          console.log('(Simulation mode ENABLED)');
        }
      }
    } catch (error: any) {
      if (DEBUG) console.log('Error initializing ApiManager:', error.message);
    }
  }

  async setApiUrl(url: string): Promise<void> {
    this.apiUrl = url;
    await Storage.setItem(StorageKeys.API_ENDPOINT, url);
    await this.initialize();
  }

  getApiUrl(): string {
    return this.apiUrl;
  }

  getUrl(controller: string, method: string): string {
    return `${controller}/${method}`;
  }

  async sendGetRequest(url: string): Promise<AxiosResponse | null> {
    try {
      if (!this.axiosInstance) {
        await this.initialize();
      }

      // Actualizar header de versión por si cambió la simulación
      const appVersion = SimulationService.getAppVersion();
      this.axiosInstance!.defaults.headers['X-App-Version'] = appVersion;

      if (DEBUG) {
        console.log('GET Request URL:', `${this.apiUrl}/${url}`);
        console.log('X-App-Version:', appVersion);
      }

      const response = await this.axiosInstance!.get(url);

      if (DEBUG) {
        console.log('Response status:', response.status);
        console.log('Response data:', JSON.stringify(response.data, null, 2));
      }

      return response;
    } catch (error: any) {
      if (DEBUG) {
        console.log('Error in sendGetRequest:', error.message);
      }
      return null;
    }
  }

  async checkApiVersion(): Promise<{ isValid: boolean; currentVersion?: string; apiInfo?: ApiVersionInfo; message?: string }> {
    console.log('[DEBUG] checkApiVersion: START');
    try {
      if (!this.axiosInstance) {
        console.log('[DEBUG] checkApiVersion: No axios instance, initializing...');
        await this.initialize();
      }

      const url = `${this.apiUrl}/version`;
      console.log('[DEBUG] checkApiVersion: Calling URL:', url);
      const response = await this.axiosInstance!.get('/version');
      console.log('[DEBUG] checkApiVersion: Response received:', response?.status);

      if (response && response.data) {
        const apiInfo: ApiVersionInfo = response.data;
        const apiVersion = apiInfo.version || '0.0.0';
        const compatibleVersions: string[] = apiInfo.compatible_versions || [];
        const minClientVersion = apiInfo.min_client_version;

        // Usar versión simulada si está habilitada
        const clientVersion = SimulationService.getAppVersion();

        if (DEBUG) {
          console.log('API Version Info:');
          console.log('  API Version:', apiVersion);
          console.log('  Client Version:', clientVersion);
          console.log('  Simulation Mode:', SimulationService.isEnabled() ? 'ENABLED' : 'disabled');
          console.log('  Compatible Versions:', compatibleVersions);
          console.log('  Min Client Version:', minClientVersion);
        }

        let isValid = false;
        let message = '';

        // Verificar version minima del cliente
        if (minClientVersion) {
          const appVersionValid = this.isVersionValid(clientVersion, minClientVersion);
          if (!appVersionValid) {
            message = `Versión de su App: ${clientVersion}\n`;
            message += `Versión mínima requerida: ${minClientVersion}\n\n`;
            message += 'Necesita actualizar su aplicación.';
            return { isValid: false, currentVersion: apiVersion, apiInfo, message };
          }
        }

        // Verificar compatibilidad de API
        if (apiVersion === REQUIRED_API_VERSION) {
          isValid = true;
        } else if (compatibleVersions.includes(REQUIRED_API_VERSION)) {
          isValid = true;
        } else {
          isValid = this.isVersionValid(apiVersion, REQUIRED_API_VERSION);
        }

        if (!isValid) {
          message = `Versión de la API: ${apiVersion}\n`;
          message += `Versión requerida: ${REQUIRED_API_VERSION}\n\n`;
          message += 'La API no es compatible.';
        }

        return { isValid, currentVersion: apiVersion, apiInfo };
      }

      return { isValid: false, message: 'No se pudo obtener versión de la API' };
    } catch (error: any) {
      if (DEBUG) console.log('Error checking API version:', error.message);
      return { isValid: true }; // Permitir continuar si no hay endpoint
    }
  }

  private isVersionValid(currentVersion: string, requiredVersion: string): boolean {
    const current = this.parseVersion(currentVersion);
    const required = this.parseVersion(requiredVersion);

    if (current.major > required.major) return true;
    if (current.major < required.major) return false;

    if (current.minor > required.minor) return true;
    if (current.minor < required.minor) return false;

    return current.patch >= required.patch;
  }

  private parseVersion(version: string): { major: number; minor: number; patch: number } {
    const parts = version.split('.').map(part => parseInt(part, 10) || 0);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0
    };
  }
}

export default new ApiManagerService();
