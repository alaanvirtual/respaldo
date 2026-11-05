# reporte de evaluación formativa y retroalimentación técnica

> **información de la evaluación:**
> * **entrega:** [ejemplo: entregable 1.1]
> * **tag evaluado:** `v0.1.0-e1.1`
> * **estado:** validado por el runner automatizado
> * **calificación calculada:** **100 / 100**
> * **sincronización con moodle:** transmitido exitosamente al libro de calificaciones.

---

## 1. matriz de verificación de contratos http

| endpoint evaluado | método | código esperado | código recibido | estado |
| :--- | :---: | :---: | :---: | :---: |
| `/api/v1/auth/register` | POST | `201 Created` | `201 Created` | ✓ aprobado |
| `/api/v1/auth/login` | POST | `200 OK` | `200 OK` | ✓ aprobado |
| `/api/v1/auth/me` | GET | `200 OK` (con bearer) | `200 OK` | ✓ aprobado |
| `/api/v1/auth/me` | GET | `401 Unauthorized` (sin token) | `401 Unauthorized` | ✓ aprobado |

---

## 2. criterios formativos y recomendaciones técnicas

* **seguridad y hashing:** contraseñas almacenadas correctamente con algoritmo bcrypt (factor de costo verificado).
* **validación de esquemas:** campos vacíos rechazados con código http 400.
* **política de segunda oportunidad (-rev):**
  si su calificación es menor a 80 puntos, dispone de una ventana de 48 horas para corregir las observaciones y publicar una etiqueta de revisión (ejemplo: `v0.1.1-e1.1-rev`). el autograding recalculará la nota y actualizará moodle automáticamente.
