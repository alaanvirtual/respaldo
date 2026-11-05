import { Concentration, isValidConcentration } from '../value-objects/Concentration';
import { InsufficientStockError } from '../errors/InsufficientStockError';
import { InvalidPerfumeDataError } from '../errors/InvalidPerfumeDataError';

export interface PerfumeProps {
  id: string;
  name: string;
  brand: string;
  concentration: Concentration;
  sizeMl: number;
  price: number;
  stock: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CreatePerfumeProps = Omit<PerfumeProps, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
};

export class Perfume {
  private readonly _id: string;
  private _name: string;
  private _brand: string;
  private _concentration: Concentration;
  private _sizeMl: number;
  private _price: number;
  private _stock: number;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: PerfumeProps) {
    this.validate(props);

    this._id = props.id;
    this._name = props.name.trim();
    this._brand = props.brand.trim();
    this._concentration = props.concentration;
    this._sizeMl = props.sizeMl;
    this._price = props.price;
    this._stock = props.stock;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public static create(props: CreatePerfumeProps): Perfume {
    const id = props.id ?? Perfume.generateId();
    return new Perfume({
      ...props,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public static reconstitute(props: PerfumeProps): Perfume {
    return new Perfume(props);
  }

  private static generateId(): string {
    // Generador de identificador único puro en TypeScript sin dependencias externas
    return 'perf_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  }

  private validate(props: PerfumeProps): void {
    if (!props.id || props.id.trim().length === 0) {
      throw new InvalidPerfumeDataError('El ID del perfume no puede estar vacío.');
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new InvalidPerfumeDataError('El nombre del perfume es obligatorio.');
    }
    if (!props.brand || props.brand.trim().length === 0) {
      throw new InvalidPerfumeDataError('La marca del perfume es obligatoria.');
    }
    if (!isValidConcentration(props.concentration)) {
      throw new InvalidPerfumeDataError(
        `Concentración inválida '${props.concentration}'. Valores válidos: EDT, EDP, Parfum, Extrait.`,
      );
    }
    if (typeof props.sizeMl !== 'number' || props.sizeMl <= 0) {
      throw new InvalidPerfumeDataError('El tamaño en mililitros (sizeMl) debe ser mayor a 0.');
    }
    if (typeof props.price !== 'number' || props.price <= 0 || Number.isNaN(props.price)) {
      throw new InvalidPerfumeDataError('El precio debe ser un número positivo mayor a 0.');
    }
    if (typeof props.stock !== 'number' || props.stock < 0 || !Number.isInteger(props.stock)) {
      throw new InvalidPerfumeDataError('El stock debe ser un número entero mayor o igual a 0.');
    }
  }

  // --- Invariantes y Métodos de Negocio ---

  public deductStock(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new InvalidPerfumeDataError(
        'La cantidad de stock a deducir debe ser un número entero positivo mayor a cero.',
      );
    }

    if (this._stock < quantity) {
      throw new InsufficientStockError(this._id, quantity, this._stock);
    }

    this._stock -= quantity;
    this._updatedAt = new Date();
  }

  public addStock(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new InvalidPerfumeDataError(
        'La cantidad de stock a ingresar debe ser un número entero positivo mayor a cero.',
      );
    }

    this._stock += quantity;
    this._updatedAt = new Date();
  }

  public updatePrice(newPrice: number): void {
    if (typeof newPrice !== 'number' || newPrice <= 0 || Number.isNaN(newPrice)) {
      throw new InvalidPerfumeDataError(
        'El nuevo precio debe ser un número positivo mayor a cero.',
      );
    }

    this._price = newPrice;
    this._updatedAt = new Date();
  }

  public updateDetails(
    name: string,
    brand: string,
    sizeMl: number,
    concentration: Concentration,
  ): void {
    if (!name || name.trim().length === 0) {
      throw new InvalidPerfumeDataError('El nombre del perfume no puede estar vacío.');
    }
    if (!brand || brand.trim().length === 0) {
      throw new InvalidPerfumeDataError('La marca del perfume no puede estar vacía.');
    }
    if (!isValidConcentration(concentration)) {
      throw new InvalidPerfumeDataError(`Concentración inválida: ${concentration}`);
    }
    if (sizeMl <= 0) {
      throw new InvalidPerfumeDataError('El tamaño en ml debe ser mayor a 0.');
    }

    this._name = name.trim();
    this._brand = brand.trim();
    this._sizeMl = sizeMl;
    this._concentration = concentration;
    this._updatedAt = new Date();
  }

  // --- Getters de solo lectura ---

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get brand(): string {
    return this._brand;
  }

  public get concentration(): Concentration {
    return this._concentration;
  }

  public get sizeMl(): number {
    return this._sizeMl;
  }

  public get price(): number {
    return this._price;
  }

  public get stock(): number {
    return this._stock;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public toJSON(): PerfumeProps {
    return {
      id: this._id,
      name: this._name,
      brand: this._brand,
      concentration: this._concentration,
      sizeMl: this._sizeMl,
      price: this._price,
      stock: this._stock,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
