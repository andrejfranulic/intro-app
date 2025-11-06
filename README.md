# intro-app
Este repo está destinado al aprendizaje de desarollo de una aplicación con MVC

# Primer Paso

- Definir un "problema"

> Tengo que hacer una agenda de contactos
> Crear contactos, Borrar contactos y Modificar contactos


Vista (donde se muestra y se edita)
Modelo (Base de datos)
Control (Lógica de control)


# CRUD

| Acción        | Método | Endpoint                    |
| ------------- | ------ | --------------------------- |
| Obtener todos | GET    | `/api/contacts`             |
| Obtener uno   | GET    | `/api/contacts/:documentId` |
| Crear         | POST   | `/api/contacts`             |
| Actualizar    | PUT    | `/api/contacts/:documentId` |
| Eliminar      | DELETE | `/api/contacts/:documentId` |
