import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { Alert, BackHandler, Platform } from 'react-native';
import ApiManager from './ApiManagerService';
import { UpdateInfo, AppVersionInfo } from '../types';

const controller = "Sistema";
const DEBUG = true;

class UpdateService {
  compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      if (parts1[i] > parts2[i]) return 1;
      if (parts1[i] < parts2[i]) return -1;
    }
    return 0;
  }

  async checkForUpdates(): Promise<UpdateInfo | null> {
    try {
      const plataforma = Platform.OS === 'android' ? 'Android' : 'iOS';
      const currentVersion = Constants.expoConfig?.version || '1.0.0';

      if (DEBUG) {
        console.log('=== CHECK UPDATES ===');
        console.log('Plataforma:', plataforma);
        console.log('Versión Actual:', currentVersion);
      }

      const method = "GetAppVersion";
      const url = ApiManager.getUrl(controller, method);
      const endpoint = `${url}/${plataforma}`;

      if (DEBUG) console.log('URL endpoint:', endpoint);

      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout verificando actualizaciones')), 15000);
      });

      const requestPromise = ApiManager.sendGetRequest(endpoint);
      const response = await Promise.race([requestPromise, timeoutPromise]);

      if (DEBUG) {
        console.log('Response:', response);
      }

      if (!response || !response.data) {
        if (DEBUG) {
          console.log('Endpoint de actualización no disponible');
        }
        return null;
      }

      const versionInfo: AppVersionInfo = response.data;
      const { versionActual, versionMinima, urlDescarga, notasVersion, actualizacionForzada } = versionInfo;

      if (DEBUG) {
        console.log('Versión Actual App:', currentVersion);
        console.log('Versión Disponible:', versionActual);
        console.log('Versión Mínima:', versionMinima);
      }

      const needsUpdate = this.compareVersions(currentVersion, versionActual) < 0;
      const isCompatible = this.compareVersions(currentVersion, versionMinima) >= 0;

      if (DEBUG) {
        console.log('Necesita Actualización:', needsUpdate);
        console.log('Es Compatible:', isCompatible);
        console.log('Forzar Actualización:', actualizacionForzada);
        console.log('=====================\n');
      }

      return {
        needsUpdate,
        isCompatible,
        forceUpdate: actualizacionForzada || !isCompatible,
        latestVersion: versionActual,
        currentVersion,
        downloadUrl: urlDescarga,
        releaseNotes: notasVersion
      };
    } catch (error) {
      if (DEBUG) {
        console.log('No se pudo verificar actualizaciones:', error);
      }
      return null;
    }
  }

  async downloadAndInstall(downloadUrl: string, onProgress?: (progress: number) => void): Promise<boolean> {
    if (Platform.OS !== 'android') {
      Alert.alert('Error', 'Auto-actualización solo disponible en Android');
      return false;
    }

    try {
      if (DEBUG) {
        console.log('=== INICIO DESCARGA DE ACTUALIZACIÓN ===');
        console.log('URL de descarga:', downloadUrl);
      }

      const fileName = downloadUrl.split('/').pop() || 'update.apk';
      const fileUri = FileSystem.cacheDirectory + fileName;

      if (DEBUG) {
        console.log('Descargando archivo:', fileName);
        console.log('Ruta de descarga:', fileUri);
      }

      // Eliminar APKs antiguos
      try {
        const cacheDir = FileSystem.cacheDirectory;
        if (cacheDir) {
          const files = await FileSystem.readDirectoryAsync(cacheDir);
          const apkFiles = files.filter(file => file.endsWith('.apk'));

          for (const apkFile of apkFiles) {
            await FileSystem.deleteAsync(cacheDir + apkFile, { idempotent: true });
          }
        }
      } catch (deleteError) {
        if (DEBUG) console.log('No se pudieron eliminar archivos antiguos:', deleteError);
      }

      // Verificar espacio en disco
      const diskSpace = await FileSystem.getFreeDiskStorageAsync();
      const MIN_SPACE_MB = 100;
      const MIN_SPACE_BYTES = MIN_SPACE_MB * 1024 * 1024;

      if (diskSpace < MIN_SPACE_BYTES) {
        Alert.alert(
          'Espacio Insuficiente',
          `No hay suficiente espacio en el dispositivo.\n\nEspacio libre: ${Math.round(diskSpace / (1024 * 1024))} MB\nRequerido: ${MIN_SPACE_MB} MB`
        );
        return false;
      }

      const downloadResumable = FileSystem.createDownloadResumable(
        downloadUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          if (onProgress) onProgress(progress);
        }
      );

      const result = await downloadResumable.downloadAsync();

      if (!result) {
        throw new Error('Error al descargar el archivo');
      }

      const { uri } = result;

      if (DEBUG) console.log('Downloaded APK to:', uri);

      return new Promise<boolean>((resolve) => {
        Alert.alert(
          'Descarga Completa',
          'Actualización descargada\n\n¿Instalar ahora?',
          [
            {
              text: 'Instalar',
              onPress: async () => {
                try {
                  const contentUri = await FileSystem.getContentUriAsync(uri);

                  if (DEBUG) console.log('Content URI:', contentUri);

                  await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                    data: contentUri,
                    type: 'application/vnd.android.package-archive',
                    flags: 1
                  });

                  if (DEBUG) console.log('Instalador abierto');

                  setTimeout(() => {
                    BackHandler.exitApp();
                  }, 500);

                  resolve(true);
                } catch (installError) {
                  console.error('Error abriendo instalador:', installError);
                  Alert.alert(
                    'Error',
                    'No se pudo abrir el instalador automáticamente.\n\nBusca el APK descargado manualmente.'
                  );
                  resolve(false);
                }
              }
            },
            {
              text: 'Más Tarde',
              style: 'cancel',
              onPress: () => resolve(true)
            }
          ]
        );
      });
    } catch (error: any) {
      console.error('Error downloading update:', error);
      Alert.alert('Error', 'No se pudo descargar la actualización: ' + error.message);
      return false;
    }
  }
}

export default new UpdateService();
