# 知声 / 凡愚 — instrumento visual

Instrumento visual web para interpretar **凡愚 (feat. 知声)** de isonosuke. La persona escucha la canción y modifica el entorno; no hay análisis de audio ni reproducción automática de efectos.

## Ejecutar

Los módulos ES y el MP3 deben servirse por HTTP local (no abrir `index.html` como `file://`). En VS Code, instala la extensión **Live Server** si no tienes un servidor local, haz clic derecho en `index.html` y selecciona **Open with Live Server**. También puedes ejecutar en PowerShell desde esta carpeta:

```powershell
py -m http.server 8000
```

Después abre `http://localhost:8000`. No se requieren dependencias de JavaScript. El MP3 se carga desde `./凡愚 (feat. 知声).mp3`; el MP4 original se conserva en la raíz, pero no se presenta como fondo ni se necesita para ejecutar la obra.

## Arquitectura y algoritmos

- **`Agent.js`** separa percepción, cálculo de acción, integración física y dibujo. Cada agente mantiene posición, velocidad, aceleración, velocidad y fuerza máximas, estado de wander y una vecindad local. Seek, arrive, wander y separation calculan fuerzas de dirección; la suma se limita antes de integrarla.
- **`Flocking.js`** usa una cuadrícula espacial para consultar solo vecinos dentro del radio perceptivo. Calcula separación, alineación y cohesión; el control Agrupación cambia el balance de las tres fuerzas.
- **`FlowField.js`** calcula direcciones orgánicas consultables por posición. Los agentes convierten la dirección local en steering; Dirección y la rueda del ratón transforman la orientación y la escala.
- **`Physarum.js`** mantiene una señal en una cuadrícula de baja resolución. Los agentes leen tres sensores adelantados, giran hacia la señal más intensa y depositan sustancia. Difusión y disipación evitan una acumulación permanente; Memoria ajusta depósito, sensibilidad espacial y persistencia.
- **`main.js`** combina las fuerzas con pesos acotados, actualiza el sistema y coordina controles, audio, pausa y reinicio.
- **`Vec2.js`** contiene operaciones vectoriales compartidas. **`index.html`** define la interfaz y las rutas locales; **`style.css`** organiza la escena y sus controles.

La carpeta incluye capturas de referencia del videoclip (`Screenshot 2026-10-27 ...png`). En ellas se observa un marco de ventana retro, fondos negros, tipografía japonesa blanca de gran escala, formas geométricas planas, siluetas, patrones repetidos y cambios de alto contraste entre violeta/gris, verde digital y ámbar. La escena traslada esos recursos mediante un marco dibujado, los kanji originales del título como cursor de gesto y ambientes gráficos que cambian de composición según el preset. No reproduce al personaje ni toma versos del videoclip.

## Relación con los materiales de estudio

- [The Nature of Code, capítulo 5: Autonomous Agents](https://natureofcode.com/autonomous-agents/): percepción limitada, estado interno y acción sin líder.
- [Craig Reynolds, Steering Behaviors for Autonomous Characters](https://www.red3d.com/cwr/steer/): velocidades deseadas, fuerzas de dirección y combinación de comportamientos.
- [Tyler Hobbs, Flow Fields](https://www.tylerxhobbs.com/words/flow-fields): campo espacial de ángulos consultado por los agentes, cuya escala y orientación se pueden transformar.
- [Three.js Birds (GPGPU flocking)](https://threejs.org/examples/webgl_gpgpu_birds.html): separación, alineación y cohesión como referencia algorítmica; esta versión los calcula en JavaScript y no depende de Three.js.
- [Interactive Physarum — Bleuje](https://github.com/Bleuje/interactive-physarum) y su [explicación del algoritmo](https://bleuje.com/physarum-explanation/): sensores adelantados, giro hacia el rastro más intenso, depósito, difusión y disipación.

La consigna de la Unidad 6 no enlaza ni identifica un trabajo de Sofía y no se encontró ese material entre los archivos del proyecto; por eso no se le atribuyen ejemplos ni decisiones específicas.

## Controles para interpretar

- **Energía:** modifica velocidad máxima y fuerza de dirección.
- **Agrupación:** incrementa alineación y cohesión respecto a separación.
- **Memoria:** cambia cuánto depositan los agentes, la distancia sensorial y cuánto persisten las huellas.
- **Alcance:** cambia el radio de influencia del gesto y el tamaño del pincel de rastros.
- **Escena** (botón o M): alterna violeta geométrico, interferencia gris-violeta, señal verde, órbita ámbar y patrón de ondas. Cada cambio transforma la organización gráfica y reorienta/reescala el campo.
- **Dirección** (botones o flechas izquierda/derecha): gira el campo de flujo.
- **Rueda del ratón:** comprime o expande la escala espacial del campo.
- **Herramientas de gesto** (botones o teclas 1–4): cada gesto usa como cursor un kanji de **凡愚知声**. 凡 convoca, 愚 dispersa, 知 siembra señal persistente que los agentes perciben y 声 gira el campo mientras se arrastra.
- **Estados radicales** (botones o teclas Q/W/E/T): aplican configuraciones completas de energía, agrupación, memoria, alcance, escala, impulso y composición de fondo; también cambian la paleta y la forma de cada agente. **静 Suspensión** usa triángulos sobre planos sobrios y reduce velocidad, **奔 Oleada** convierte agentes en círculos y suma un campo violeta concéntrico, **断 Fractura** usa cuadrados, bandas y mosaicos, y **爆 Estallido** usa X, fondo ámbar y una ráfaga radial.
- **H:** oculta o muestra el panel de modificadores sin detener la simulación; el botón permanece accesible para volver a abrirlo.
- **Espacio:** pausa/continúa. **R:** reinicia agentes y rastros.
- **Atajos de dirección:** flechas izquierda/derecha.
- **Transporte de audio:** reproduce o pausa la canción local y permite ajustar el volumen. El navegador puede exigir una acción explícita para reproducir.

El cursor nativo se oculta dentro de la escena y se sustituye por el kanji de la herramienta activa. El gesto solo añade fuerzas temporales o señal al entorno; no asigna posiciones a los agentes. Cada individuo sigue combinando el campo, su vecindad, su exploración y la memoria local. Cada preset aplica un impulso vectorial acotado: las transiciones intensas son más bruscas sin teletransportar agentes.

## Intención y referencia

La consigna de la [Unidad 6](https://juanferfranco.github.io/simulacion-2026-20/units/unit6/) pide una interpretación humana con steering, flocking, flow fields e Interactive Physarum. La propuesta convierte dirección en corriente, agrupación en densidad colectiva y memoria en rastros que alteran decisiones posteriores. Se inspeccionaron las capturas disponibles en la carpeta, incluidas las añadidas para esta iteración; de ellas derivan el marco de ventana, los kanji como herramienta de interpretación, las familias cromáticas y los patrones geométricos. No se pudo abrir el reproductor de YouTube desde el navegador integrado, así que las capturas fueron la referencia visual directa.

## Score abierto de ensayo

Los momentos son hitos auditivos que se reconocen escuchando, no marcas de tiempo ni comandos automatizados.

| Momento reconocible | Intención | Intervención posible | Respuesta que observar |
|---|---|---|---|
| Inicio o pasaje más contenido | Escuchar y establecer una corriente | **Q / Suspensión**, luego orientar con flechas | Agentes lentos, cercanos y señales persistentes |
| Entrada de una voz, motivo o pulso reconocible | Convocar y formar un foco | **W / Oleada** y arrastrar 凡 | Aceleración visible y concentración temporal |
| Aumento de intensidad | Crear presión y densidad | **T / Estallido**; trazar con 愚 o 声 | Impulso colectivo y cambio de paleta |
| Cambio, quiebre o contraste | Desestabilizar la corriente | **E / Fractura**, gesto 愚 y cambiar escena | Dispersión y nueva dirección del campo |
| Descenso o cierre | Dejar que el sistema respire | **Q / Suspensión**, sembrar 知 y soltar el gesto | Las fuerzas se aflojan y la señal se disipa gradualmente |

Ensaya variaciones: cambia entre Q/W/E/T en un mismo pasaje, pausa para explicar la autonomía y reinicia para comparar. La partitura orienta la escucha; no impone resultados.

## Pruebas para la defensa

1. Reproduce el MP3 y demuestra que la imagen no sigue automáticamente la amplitud o el ritmo.
2. Selecciona Convocar y luego Dispersar; compara atracción, separación y dispersión mientras el kanji acompaña el gesto.
3. Cambia Agrupación y explica cómo varían separación, alineación y cohesión.
4. Selecciona Sembrar y arrastra; las señales creadas deben orientar a los agentes y disiparse gradualmente.
5. Activa los cuatro presets; explica los valores, el impulso y el cambio de paleta de cada transición.
6. Cambia escena y dirección; muestra que se reorienta y escala el campo consultado por los agentes.
7. Cambia Memoria y Alcance; observa el balance de persistencia y el radio de respuesta.
8. Pausa, continúa y reinicia; verifica que el reinicio limpia las señales.

Los archivos de referencia permanecen con sus nombres originales en la raíz. La obra no necesita cargar el MP4. El audio incluye un mensaje en pantalla si no puede cargar; se requiere un servidor HTTP local para módulos y medios.
