# NutriCampus

Aplicación web MVP de planificación nutricional y delivery programado para la comunidad de UPC San Isidro.

- Sitio público: https://ale-26.github.io/NutriCampus/
- Demo funcional: https://ale-26.github.io/NutriCampus/app.html

## Funcionalidades del MVP

- Catálogo de menús con filtros nutricionales.
- Selección de fecha, receso y Pick-Up Spot.
- Carrito y confirmación de reserva.
- Código de reserva de demostración (no es un QR escaneable).
- Vista de pedidos, NutriPass y preferencias de perfil.

El MVP es una demostración frontend sin procesamiento real de pagos, autenticación ni integración con dark kitchens.

## Cómo está organizado

- `index.html`: página de presentación del negocio.
- `style.css`: estilos de la página de presentación.
- `script.js`: desplazamiento suave entre secciones de la página de presentación.
- `app.html`: estructura y secciones de la demo de pedidos.
- `app.css`: estilos de la demo.
- `app.js`: menú, filtros, carrito, reservas simuladas y preferencias.
- `logo-nutricampus.png`: logo usado en las páginas y en la pestaña del navegador.

## Cómo funciona el flujo de la demo

1. `app.js` tiene una lista de menús de ejemplo en `menus`.
2. `renderMenus()` crea las tarjetas y sus botones a partir de esa lista.
3. Al agregar un menú, el carrito cambia y `saveCart()` lo guarda en `localStorage` del navegador.
4. `renderCart()` vuelve a dibujar el carrito y calcula el total desde los precios del catálogo.
5. Al simular la reserva, se guarda una entrada en el historial local, se muestra un código de demostración (no un QR escaneable) y se vacía el carrito. No se envía ningún pedido.

`localStorage` es almacenamiento del navegador, no una base de datos compartida. Los menús, sus valores nutricionales, horarios y puntos de recojo son datos ilustrativos; deben validarse con las cocinas aliadas y un profesional antes de ofrecer el servicio.
