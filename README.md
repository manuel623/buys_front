# BuysFront

Este proyecto es el **Frontend** de un sistema de órdenes de compra desarrollado como parte de una prueba técnica. Está construido con **Angular 17** y utiliza **Node.js versión 20.17.0** (administrado con `nvm`).

Repositorio: https://github.com/manuel623/buys_front.git

---

## Stack Utilizado

- **Framework:** Angular 17
- **Lenguaje:** TypeScript
- **Gestor de paquetes:** NPM
- **Control de versiones:** Git
- **Administrador de versiones de Node:** NVM
- **HTTP Client:** Angular HttpClient
- **CSS Framework:** TailwindCSS

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu máquina:

- **Git** (para clonar el repositorio)
- **NVM** (Node Version Manager)
- **Node.js versión 20.17.0** (puedes verificarlo con `nvm list`)
- **Angular CLI** versión 17+

Instalar Angular CLI en caso de no tenerlo instalado:

npm install -g @angular/cli@17

## Instrucciones de Instalación y Ejecución

- **Clonar el repositorio:** `git clone https://github.com/manuel623/buys_front.git`
- **Ingresar al proyecto:** `cd buys_front`
- **Cambiar a la rama correcta** El proyecto tiene dos ramas (main y master); TODO EL CODIGO SE ENCUENTRA EN LA RAMA MASTER `git checkout master`
- **Seleccionar la versión correcta de Node.js con NVM:** `nvm use 20.17.0`
- **Instalar las dependencias:** `npm install`
- **Configuración de variables de entorno:** Debes validar que al correr el backend y en la ruta src/environments/environment.ts la variable apiUrl sean la misma URL, por defecto es `http://127.0.0.1:8000` el `/api` es una ruta interna del backend por lo que no se recomienda tocar
- **Ejecutar el proyecto:** `ng serve`

## Endpoints de la API Utilizados

Aqui un ejemplo de **ALGUNOS** endpoints utilizados en este proyecto

**Método**	**Endpoint**                                                    **Descripción**
GET	        http://127.0.0.1:8000/api/product/listProduct	                Obtiene todos los productos disponibles
POST	    http://127.0.0.1:8000/api/order/createOrder	                    Crea una nueva orden de compra
GET	        http://127.0.0.1:8000/api/orderDetail/getOrderDetails/{id}	    Obtiene detalles de una orden específica
GET	        http://127.0.0.1:8000/api/product/topPurchasedProducts	        Devuelve los productos más vendidos

**NOTA:** No se incluyen ejemplos en Postman aquí, ya que se documentarán en el README del Backend

## Anotaciones Técnicas Relevantes

- El proyecto está desarrollado con arquitectura de componentes Standalone (sin necesidad de AppModule)

- Se manejan formularios reactivos con validaciones integradas

- Los precios de los productos y órdenes se muestran formateados como valores monetarios (COP - pesos colombianos)

- El sistema maneja estado de loading y validaciones visuales para mejorar la experiencia de usuario

- Se agregó un botón adicional para consultar los productos más vendidos

- Código modular, preparado para escalar a nuevas funcionalidades.

- Comunicación vía API RESTful con control de headers y manejo de respuestas

## Autor

- Desarrollado por Manuel Cardona Martinez como parte de una prueba técnica para: S.G.I S.A.S