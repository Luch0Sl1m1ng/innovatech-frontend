/**
 * Calcula el precio final aplicando un porcentaje de descuento.
 * @param {number} precio - Precio original (>= 0)
 * @param {number} porcentaje - Porcentaje de descuento (0 a 100)
 * @returns {number} Precio con descuento aplicado
 */
export function calcularDescuento(precio, porcentaje) {
  if (precio < 0 || porcentaje < 0 || porcentaje > 100) {
    throw new Error('Parámetros inválidos para calcularDescuento');
  }
  return precio - (precio * porcentaje) / 100;
}
