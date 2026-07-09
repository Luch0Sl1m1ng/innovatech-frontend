import { describe, it, expect } from 'vitest';
import { calcularDescuento } from './calcularDescuento';

describe('calcularDescuento', () => {
  it('calcula correctamente un descuento del 10%', () => {
    expect(calcularDescuento(1000, 10)).toBe(900);
  });

  it('devuelve el mismo precio si el descuento es 0%', () => {
    expect(calcularDescuento(500, 0)).toBe(500);
  });

  it('lanza un error si el porcentaje es mayor a 100', () => {
    expect(() => calcularDescuento(1000, 150)).toThrow();
  });

  it('lanza un error si el precio es negativo', () => {
    expect(() => calcularDescuento(-100, 10)).toThrow();
  });
});
