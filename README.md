# 📱 JobActualizador

<div align="center">

**Aplicación de prueba para sistema de autoactualización**

[![React Native](https://img.shields.io/badge/React%20Native-0.79-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-52-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[Características](#-características) •
[Instalación](#-instalación) •
[Uso](#-uso) •
[API](#-api-backend)

</div>

---

## 📋 Descripción

JobActualizador es una aplicación de prueba diseñada para desarrollar y probar el sistema de autoactualización que se utiliza en las aplicaciones móviles de Jobers (JobFichador, JobRutas, etc.).

Esta aplicación permite experimentar con el sistema de control de versiones y descarga automática de APKs sin afectar a las aplicaciones en producción.

### Características principales

- 🔄 **Verificación de versiones**: Compara versión de la app con la disponible en el servidor
- 📥 **Descarga de APK**: Descarga automática de actualizaciones desde la API
- 📲 **Instalación automática**: Abre el instalador de Android automáticamente
- 🔌 **Configuración de API**: Permite cambiar la URL de la API dinámicamente
- 📊 **Info detallada**: Muestra información completa de versiones (App y API)
- ⚠️ **Actualizaciones forzadas**: Soporte para actualizaciones obligatorias

---

## 🛠️ Tecnologías

- **React Native** - Framework multiplataforma
- **Expo SDK 52** - Herramientas de desarrollo y build
- **TypeScript** - Tipado estático
- **Axios** - Cliente HTTP
- **AsyncStorage** - Almacenamiento local persistente
- **expo-file-system** - Gestión de archivos y descargas
- **expo-intent-launcher** - Apertura del instalador de Android

---

## 📋 Requisitos previos

- Node.js 18 o superior
- npm o yarn
- Cuenta en [Expo](https://expo.dev) (para builds)
- JobActualizadorApi ejecutándose y accesible
- Android SDK (para desarrollo local)

---

## 🚀 Instalación

1. **Navega al directorio:**
```bash
cd JobActualizador
```

2. **Instala las dependencias:**
```bash
npm install
```

3. **Inicia el proyecto:**
```bash
npx expo start
```

4. **Ejecuta en dispositivo/emulador:**
   - Presiona `a` para Android
   - Escanea el QR con Expo Go

---

## 📱 Uso

### Configuración inicial

1. **Inicia la API** en `http://localhost:5000` (o tu servidor)
2. **Abre la app** en el emulador o dispositivo
3. **Configura la URL de la API**:
   - Emulador Android: `http://10.0.2.2:5000/api`
   - Dispositivo físico: `http://TU_IP:5000/api`
4. **Pulsa "Conectar"** para verificar la conexión

### Pantalla principal

La app muestra:

| Sección | Descripción |
|---------|-------------|
| **Configuración API** | Campo para URL y botón conectar |
| **Info de Versiones** | Versión de App, API, framework, etc. |
| **Estado de Actualización** | Si hay actualizaciones disponibles |

### Flujo de actualización

1. La app consulta `/api/version` para info de la API
2. Consulta `/api/Sistema/GetAppVersion/{plataforma}` para versión disponible
3. Compara versiones y muestra estado
4. Si hay actualización:
   - Muestra botón "Descargar Actualización"
   - Descarga el APK con barra de progreso
   - Abre el instalador de Android

---

## 📁 Estructura del Proyecto

```
JobActualizador/
├── App.tsx                    # Pantalla principal
├── app.json                   # Configuración Expo
├── services/
│   ├── ApiManagerService.ts   # Gestión de conexión API
│   └── UpdateService.ts       # Sistema de autoactualizacion
├── types/
│   └── index.ts               # Tipos TypeScript
├── utils/
│   └── Storage.ts             # Wrapper de AsyncStorage
└── assets/                    # Recursos estáticos
```

---

## ⚙️ Servicios

### ApiManagerService

Gestión de comunicación con la API:

```typescript
// Configurar URL de la API
await ApiManager.setApiUrl('http://localhost:5000/api');

// Verificar versión de la API
const result = await ApiManager.checkApiVersion();
// { isValid: true, currentVersion: '1.0.0', apiInfo: {...} }

// Hacer petición GET
const response = await ApiManager.sendGetRequest('Sistema/GetAppVersion/Android');
```

### UpdateService

Sistema de verificación y descarga de actualizaciones:

```typescript
// Verificar actualizaciones
const updateInfo = await UpdateService.checkForUpdates();
// { needsUpdate: true, latestVersion: '1.0.1', downloadUrl: '...', ... }

// Descargar e instalar
await UpdateService.downloadAndInstall(updateInfo.downloadUrl, (progress) => {
  console.log(`Progreso: ${progress * 100}%`);
});
```

---

## 🔌 API Backend

Esta aplicación requiere [JobActualizadorApi](../JobActualizadorApi) ejecutándose.

### Endpoints utilizados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api` | Health check |
| GET | `/api/version` | Información de versión de la API |
| GET | `/api/Sistema/GetAppVersion/{plataforma}` | Versión disponible para Android/iOS |
| GET | `/api/Sistema/Download/{fileName}` | Descargar APK |

### Ejemplo de respuesta `/api/version`

```json
{
  "version": "1.0.0",
  "compatible_versions": ["1.0.0"],
  "min_client_version": "1.0.0",
  "framework": ".NET 8.0",
  "title": "JobActualizadorApi"
}
```

### Ejemplo de respuesta `/api/Sistema/GetAppVersion/Android`

```json
{
  "versionActual": "1.0.1",
  "versionMinima": "1.0.0",
  "urlDescarga": "http://localhost:5000/api/Sistema/Download/JobActualizador101.apk",
  "notasVersion": "Primera version de prueba",
  "actualizacionForzada": false
}
```

---

## 🔨 Build y Publicación

### Desarrollo
```bash
npx expo start
```

### Build Android (APK de prueba)
```bash
eas build -p android --profile preview
```

### Actualización de versión

1. Actualizar `version` en `app.json`
2. Actualizar `REQUIRED_API_VERSION` en `ApiManagerService.ts` si es necesario

---

## 🎯 Casos de prueba

### 1. Versión actualizada
- App: 1.0.0, Servidor: 1.0.0
- Resultado: "No necesita actualizar"

### 2. Actualización disponible
- App: 1.0.0, Servidor: 1.0.1
- Resultado: Muestra botón de descarga

### 3. Actualización forzada
- App: 0.9.0, Versión mínima: 1.0.0
- Resultado: Alerta obligatoria de actualización

### 4. API incompatible
- API: 2.0.0, App requiere: 1.0.x
- Resultado: Mensaje de incompatibilidad

---

## ❓ Solución de problemas

### "Network request failed"
- Verificar que la API esté ejecutándose
- En emulador Android usar `10.0.2.2` en lugar de `localhost`
- Verificar firewall y puertos

### "No se puede instalar APK"
- Habilitar "Instalar apps de fuentes desconocidas" en Android
- Verificar permiso `REQUEST_INSTALL_PACKAGES` en app.json

### "Timeout verificando actualizaciones"
- La API tarda más de 15 segundos en responder
- Verificar conexión de red
- Revisar logs de la API

---

## 📧 Contacto

**Jobers y Asociados, S.L**
- Email: rsanfelix@jobers.net
- Teléfono: 626 99 09 26
- Web: [www.jobersweb.com](https://www.jobersweb.com/)

---

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - consulta el archivo [LICENSE](LICENSE) para más detalles.

Copyright (c) 2025 Jobers y Asociados, S.L. y Ramón San Félix Ramón

---

**Versión:** 1.0.0
**Última actualización:** 09-12-2025
