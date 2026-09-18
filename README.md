# Visor 3D Interactivo con Three.js

**Desarrollado por:** Chavarin & Godinez  
**Actividad:** Entregable de creación de visor 3D en navegador.

Este proyecto es una aplicación web interactiva que renderiza una escena 3D utilizando la biblioteca [Three.js](https://threejs.org/). Permite la exploración espacial mediante controles de órbita, carga de modelos externos y selección de objetos mediante la técnica de Raycasting.

## 🚀 Cómo ejecutar el proyecto

Debido a que el proyecto carga modelos externos (`.glb`), **no puede abrirse simplemente haciendo doble clic en el archivo `index.html`** debido a las políticas de seguridad CORS de los navegadores. Debes usar un servidor local:

**Opción 1: Usando XAMPP (Apache)**
1. Copia toda la carpeta del proyecto dentro del directorio `htdocs` de tu instalación de XAMPP (por ejemplo: `C:\xampp\htdocs\pract01`).
2. Enciende el módulo Apache en el panel de control de XAMPP.
3. Abre tu navegador y navega a: `http://localhost/pract01`

**Opción 2: Usando VS Code (Live Server)**
1. Abre la carpeta del proyecto en Visual Studio Code.
2. Instala la extensión **Live Server**.
3. Haz clic derecho sobre el archivo `index.html` y selecciona "Open with Live Server".

---

## 📝 Respuestas de la Actividad

### ¿Qué función cumple la escena en Three.js?
La escena (`THREE.Scene`) actúa como un contenedor principal o grafo de escena. Es el espacio virtual donde colocamos todos nuestros objetos (mallas, geometrías), luces y cámaras para que el motor pueda saber qué es lo que debe ser renderizado en la pantalla.

### ¿Para qué sirve la cámara?
La cámara (en este caso `PerspectiveCamera`) define el punto de vista desde el cual se va a observar la escena. Determina qué parte del mundo 3D es visible basándose en parámetros como el campo de visión (FOV), la relación de aspecto y los planos de recorte cercano y lejano.

### ¿Qué hace el renderer?
El renderizador (`WebGLRenderer`) es el motor de dibujo. Toma la escena y la cámara que hemos definido, y utiliza WebGL para procesar los cálculos matemáticos e iluminación, dibujando el resultado final como píxeles 2D dentro del elemento `<canvas>` en nuestra página HTML.

### ¿Qué permite hacer OrbitControls?
Es un módulo adicional que permite al usuario interactuar fluidamente con la cámara usando el mouse o gestos táctiles. Permite orbitar (rotar alrededor de un punto central), hacer paneo (mover la cámara en paralelo) y zoom (acercar/alejar).

### ¿Qué es el raycasting y para qué lo usaste?
El Raycasting es una técnica que consiste en trazar un "rayo" invisible desde la cámara, que pasa a través de la posición del puntero del mouse (2D) hacia el mundo 3D. Lo usamos para detectar intersecciones entre ese rayo y las geometrías de la escena. En este proyecto, sirve para saber exactamente en qué objeto 3D hizo clic el usuario y así poder resaltarlo y mostrar su información.

### ¿Qué dificultades tuviste al cargar modelos .glb o .gltf?
Las principales dificultades suelen ser:
1. **Errores de CORS:** Intentar cargar el modelo abriendo el archivo localmente sin un servidor HTTP.
2. **Materiales e Iluminación:** Si la escena no tiene luces adecuadamente configuradas, los materiales PBR del modelo `.glb` se verán completamente negros.
3. **Escala y Posicionamiento:** A menudo los modelos descargados de internet vienen en escalas gigantes o microscópicas, requiriendo ajustes de `.scale` y `.position` para que se vean en la cámara.

### ¿Cómo podrías usar este visor 3D en un proyecto de simulación, videojuegos, bioinformática o modelado 3D?
*   **En Bioinformática:** Se podría adaptar para visualizar estructuras moleculares complejas, interactuar con plegamientos de proteínas (como los generados por AlphaFold), o visualizar ensamblajes de lecturas de secuenciación NGS de forma tridimensional e interactiva.
*   **En Simulación y Logística:** Podría visualizar el estado en tiempo real de almacenes o rutas de cotización de envíos mediante la integración con un backend (como Laravel).
*   **En Videojuegos:** Serviría como un visor de *assets* en el navegador para que el equipo de arte apruebe los modelos antes de pasarlos al motor principal.