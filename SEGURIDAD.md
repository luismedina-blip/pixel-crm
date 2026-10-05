# PIXEL CRM – Análisis de Seguridad OWASP Top 10:2025

**Proyecto:** PIXEL CRM – Sistema de Gestión de Inventario  
**Estudiante:** Luis Medina  
**Docente:** Ing. Julio Vásconez  
**Fecha:** Octubre 2026  

---

## 1. Objetivo

Evaluar la seguridad del sistema PIXEL CRM utilizando como referencia las diez categorías de OWASP Top 10:2025.

Durante el análisis se revisaron las rutas de la API, autenticación, autorización por roles, manejo de datos, dependencias, configuración y tratamiento de errores.

Además de identificar riesgos, se realizaron pruebas prácticas y se implementaron mitigaciones en el código fuente.

---

## 2. Matriz de riesgos OWASP Top 10:2025

| Riesgo | ¿Aplica? | Dónde | Cómo podría explotarse | Solución aplicada/propuesta | Prioridad | Responsable |
|---|---|---|---|---|---|---|
| **A01 – Control de acceso roto** | Sí | `POST /api/dispositivos` | Un usuario con rol vendedor podía registrar dispositivos aunque la operación debía estar reservada al administrador. | Se implementó validación del token y comprobación del rol `administrador` directamente en el servidor. | Alta | Luis Medina |
| **A02 – Configuración de seguridad incorrecta** | Sí | API y manejo de errores | Los mensajes del backend podían revelar información técnica interna proveniente de Supabase, como detalles de restricciones de la base de datos. | Se reemplazaron los errores técnicos por mensajes genéricos y controlados. | Media | Luis Medina |
| **A03 – Fallas en la cadena de suministro de software** | Sí | `package.json` / `package-lock.json` | `npm audit` detectó inicialmente 6 vulnerabilidades: 5 de severidad alta y 1 crítica. | Se actualizaron Next.js y `eslint-config-next` de 16.3.5 a 16.3.8. Se eliminó la vulnerabilidad crítica. Permanecen vulnerabilidades altas asociadas a dependencias de ESLint; no se utilizó `--force` porque proponía una versión incompatible/anterior. | Alta | Luis Medina |
| **A04 – Fallas criptográficas** | No se evidenció una falla concreta | Supabase Auth / `.env.local` / `lib/supabase.ts` | No se encontraron contraseñas almacenadas manualmente ni algoritmos criptográficos propios. La autenticación se delega a Supabase Auth y `.env.local` está excluido del repositorio Git. | Mantener Supabase Auth, utilizar HTTPS en producción y mantener las variables sensibles fuera del repositorio. | Media | Luis Medina |
| **A05 – Inyección** | No se evidenció una falla concreta | APIs y formularios | No se encontró SQL construido mediante concatenación, `.raw()`, `innerHTML` ni `dangerouslySetInnerHTML`. | Se utiliza el cliente de Supabase para las consultas y validación del lado servidor para datos como IMEI y precios. | Media | Luis Medina |
| **A06 – Diseño inseguro** | No se evidenció una falla concreta | Flujo de autenticación, roles y registro | Se revisó si las operaciones sensibles dependían exclusivamente de controles del navegador. Los controles sensibles revisados cuentan con validación del lado servidor. | Mantener autorización en backend, mínimo privilegio y el principio de no confiar en los datos provenientes del cliente. | Media | Luis Medina |
| **A07 – Fallas de autenticación** | Sí | `GET /api/usuarios` / `app/login/page.tsx` | La consulta de usuarios podía realizarse sin comprobar previamente un Bearer token válido. | La API exige token, lo valida mediante Supabase Auth y el frontend envía el `access_token`. Las solicitudes sin autenticación reciben HTTP 401. | Alta | Luis Medina |
| **A08 – Fallas de integridad de software o datos** | Sí | `app/usuarios/page.tsx` / `GET /api/usuarios` | El rol almacenado en `sessionStorage` puede ser manipulado desde el navegador y no debe utilizarse como única fuente de autorización. | El backend valida el token y verifica el rol directamente contra la información del usuario antes de entregar información administrativa. | Alta | Luis Medina |
| **A09 – Fallas de registro y alertas** | Sí | `app/api/dispositivos/route.ts` | Los accesos prohibidos eran rechazados, pero no existía un registro específico del evento de seguridad. | Se incorporaron registros de seguridad del lado servidor mediante `console.warn`, sin almacenar contraseñas ni tokens. | Media | Luis Medina |
| **A10 – Manejo inadecuado de condiciones excepcionales** | Controlado actualmente | APIs de dispositivos y usuarios | Una excepción mal gestionada podría revelar información interna o generar respuestas inconsistentes. | Las APIs utilizan `try/catch`, códigos HTTP controlados y mensajes genéricos como `"Error interno del servidor."`. | Media | Luis Medina |

---

## 3. Pruebas prácticas realizadas

### A01 – Control de acceso roto

Se realizó una prueba utilizando una cuenta con rol `vendedor`.

Antes de implementar la mitigación, el vendedor podía registrar un dispositivo aunque la operación debía estar restringida al administrador.

Después de implementar la validación del rol en el servidor, el mismo intento fue rechazado con:

`403 Forbidden`

Mensaje mostrado:

> Acceso denegado. Solo el administrador puede registrar dispositivos.

Posteriormente se realizó la misma operación utilizando la cuenta de administrador y el registro fue permitido correctamente.

---

### A07 – Fallas de autenticación

Se probó el acceso directo a la API de usuarios sin una sesión autenticada.

La API respondió:

`401 Unauthorized`

Respuesta:

`{"error":"No autorizado. Se requiere autenticación."}`

Esto demuestra que la API ya no permite consultar esta información sin presentar un token válido.

---

### A09 – Fallas de registro y alertas

Se realizó un intento de registro de dispositivo utilizando una cuenta con rol vendedor.

El servidor rechazó la solicitud con HTTP 403 y registró el evento:

`[SEGURIDAD][A09] Intento de acceso sin permisos - usuario: vendedor@pixel.com, rol: vendedor`

También se registró:

`POST /api/dispositivos 403`

De esta manera, además de bloquear la operación, PIXEL CRM deja evidencia del intento de acceso no autorizado.

---

## 4. Dependencias y cadena de suministro

Durante la revisión se ejecutó:

`npm audit`

Inicialmente fueron detectadas:

- 1 vulnerabilidad crítica.
- 5 vulnerabilidades altas.

Se actualizaron:

- `next`: 16.3.5 → 16.3.8
- `eslint-config-next`: 16.3.5 → 16.3.8

Después de la actualización se eliminó la vulnerabilidad crítica.

Permanecieron cinco vulnerabilidades altas asociadas a la cadena de dependencias de ESLint.

No se utilizó automáticamente `npm audit fix --force`, debido a que proponía instalar `eslint-config-next@14.2.35`, lo que implicaba un cambio potencialmente incompatible respecto a la versión 16.3.8 utilizada por el proyecto.

---

## 5. Principios de seguridad aplicados

Durante la revisión de PIXEL CRM se aplicaron los siguientes principios:

1. **No confiar en el cliente:** las decisiones de autorización importantes se verifican en el servidor.
2. **Mínimo privilegio:** las operaciones administrativas se restringen al rol correspondiente.
3. **Defensa en profundidad:** se combinan autenticación, autorización, validación de datos y manejo controlado de errores.
4. **Fallar cerrado:** ante una sesión inválida, falta de permisos o una excepción, el sistema rechaza la operación.

---

## 6. Evidencias y commits de seguridad

Durante el análisis se realizaron commits separados para documentar diferentes mitigaciones.

Entre los principales se encuentran:

- `a9bf8b8` – Control de acceso por rol.
- `a2f2aea` – Evitar exposición de errores internos.
- `fdc0e7c` – Actualización de dependencias vulnerables.
- `d8af6d8` – Protección de consulta de usuarios para A07.
- `594ebbd` – Refuerzo del control de integridad y acceso a usuarios.
- `4ce3f9e` – Registro de accesos no autorizados para A09.

---

## 7. Conclusión

El análisis OWASP Top 10:2025 permitió identificar riesgos reales en PIXEL CRM y comprobarlos directamente sobre la aplicación.

Uno de los hallazgos de mayor impacto fue el control de acceso, debido a que inicialmente un usuario vendedor podía realizar una operación reservada al administrador. La autorización fue trasladada al servidor para evitar depender únicamente de controles de la interfaz.

También se reforzó la autenticación de las APIs, el manejo de errores, la seguridad de las dependencias y el registro de eventos de seguridad.

Las pruebas posteriores demostraron que los controles implementados bloquean los accesos no autorizados y permiten registrar eventos relevantes para su posterior análisis.

La seguridad debe mantenerse como un proceso continuo, por lo que las dependencias, permisos, registros y controles de autenticación deberán revisarse periódicamente.