import { Perfume } from '../../src/domain/entities/Perfume';
import { InsufficientStockError } from '../../src/domain/errors/InsufficientStockError';
import { InvalidPerfumeDataError } from '../../src/domain/errors/InvalidPerfumeDataError';

describe('Entidad de Dominio: Perfume', () => {
  const validProps = {
    name: 'Baccarat Rouge 540',
    brand: 'Maison Francis Kurkdjian',
    concentration: 'Extrait' as const,
    sizeMl: 70,
    price: 9500.0,
    stock: 10,
  };

  it('debe instanciar un Perfume correctamente con invariantes válidas', () => {
    const perfume = Perfume.create(validProps);

    expect(perfume.id).toBeDefined();
    expect(perfume.name).toBe('Baccarat Rouge 540');
    expect(perfume.brand).toBe('Maison Francis Kurkdjian');
    expect(perfume.concentration).toBe('Extrait');
    expect(perfume.sizeMl).toBe(70);
    expect(perfume.price).toBe(9500.0);
    expect(perfume.stock).toBe(10);
    expect(perfume.createdAt).toBeInstanceOf(Date);
  });

  it('debe rechazar la creación si el precio es negativo o cero', () => {
    expect(() => {
      Perfume.create({ ...validProps, price: 0 });
    }).toThrow(InvalidPerfumeDataError);

    expect(() => {
      Perfume.create({ ...validProps, price: -100 });
    }).toThrow(InvalidPerfumeDataError);
  });

  it('debe deducir stock correctamente cuando hay unidades suficientes', () => {
    const perfume = Perfume.create(validProps);
    perfume.deductStock(3);
    expect(perfume.stock).toBe(7);
  });

  it('debe lanzar InsufficientStockError cuando se intenta deducir más stock del disponible', () => {
    const perfume = Perfume.create(validProps);
    expect(() => {
      perfume.deductStock(15);
    }).toThrow(InsufficientStockError);
  });

  it('debe agregar stock correctamente', () => {
    const perfume = Perfume.create(validProps);
    perfume.addStock(5);
    expect(perfume.stock).toBe(15);
  });

  it('debe actualizar el precio respetando invariantes', () => {
    const perfume = Perfume.create(validProps);
    perfume.updatePrice(10200.0);
    expect(perfume.price).toBe(10200.0);
  });
});
