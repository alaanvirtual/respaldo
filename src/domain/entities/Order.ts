import { DomainError } from '../errors/DomainError';

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED';

export class InvalidOrderOperationError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

export interface OrderItem {
  readonly perfumeId: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly subtotal: number;
}

export interface OrderProps {
  id: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateOrderItemInput {
  perfumeId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderProps {
  id?: string;
  customerId: string;
  items: CreateOrderItemInput[];
}

export class Order {
  private readonly _id: string;
  private readonly _customerId: string;
  private _items: OrderItem[];
  private _totalAmount: number;
  private _status: OrderStatus;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: OrderProps) {
    this.validate(props);

    this._id = props.id;
    this._customerId = props.customerId;
    this._items = [...props.items];
    this._totalAmount = props.totalAmount;
    this._status = props.status;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public static create(props: CreateOrderProps): Order {
    if (!props.customerId || props.customerId.trim().length === 0) {
      throw new InvalidOrderOperationError('El ID del cliente es obligatorio para crear la orden.');
    }
    if (!props.items || props.items.length === 0) {
      throw new InvalidOrderOperationError('La orden debe contener al menos un producto.');
    }

    const items: OrderItem[] = props.items.map((item) => {
      if (!item.perfumeId || item.perfumeId.trim().length === 0) {
        throw new InvalidOrderOperationError('El perfumeId es obligatorio en cada ítem.');
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new InvalidOrderOperationError('La cantidad de cada ítem debe ser un entero positivo.');
      }
      if (typeof item.unitPrice !== 'number' || item.unitPrice <= 0) {
        throw new InvalidOrderOperationError('El precio unitario debe ser mayor a 0.');
      }
      return {
        perfumeId: item.perfumeId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: Math.round(item.quantity * item.unitPrice * 100) / 100,
      };
    });

    const totalAmount = items.reduce((acc, curr) => acc + curr.subtotal, 0);
    const id = props.id ?? 'ord_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

    return new Order({
      id,
      customerId: props.customerId,
      items,
      totalAmount: Math.round(totalAmount * 100) / 100,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public static reconstitute(props: OrderProps): Order {
    return new Order(props);
  }

  private validate(props: OrderProps): void {
    if (!props.id || props.id.trim().length === 0) {
      throw new InvalidOrderOperationError('El ID de la orden es obligatorio.');
    }
    if (!props.customerId || props.customerId.trim().length === 0) {
      throw new InvalidOrderOperationError('El customerId de la orden es obligatorio.');
    }
    if (!Array.isArray(props.items) || props.items.length === 0) {
      throw new InvalidOrderOperationError('La orden debe contener al menos un ítem.');
    }
    if (typeof props.totalAmount !== 'number' || props.totalAmount <= 0) {
      throw new InvalidOrderOperationError('El monto total de la orden debe ser mayor a 0.');
    }
    const validStatuses: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'];
    if (!validStatuses.includes(props.status)) {
      throw new InvalidOrderOperationError(`Estado de orden inválido: ${props.status}`);
    }
  }

  // --- Transiciones de Estado y Reglas de Negocio ---

  public markAsPaid(): void {
    if (this._status !== 'PENDING') {
      throw new InvalidOrderOperationError(
        `No se puede marcar como pagada una orden con estado actual '${this._status}'. Solo órdenes 'PENDING'.`,
      );
    }
    this._status = 'PAID';
    this._updatedAt = new Date();
  }

  public ship(): void {
    if (this._status !== 'PAID') {
      throw new InvalidOrderOperationError(
        `No se puede enviar una orden con estado '${this._status}'. Debe estar 'PAID'.`,
      );
    }
    this._status = 'SHIPPED';
    this._updatedAt = new Date();
  }

  public deliver(): void {
    if (this._status !== 'SHIPPED') {
      throw new InvalidOrderOperationError(
        `No se puede entregar una orden con estado '${this._status}'. Debe estar 'SHIPPED'.`,
      );
    }
    this._status = 'DELIVERED';
    this._updatedAt = new Date();
  }

  // --- Getters ---

  public get id(): string {
    return this._id;
  }

  public get customerId(): string {
    return this._customerId;
  }

  public get items(): readonly OrderItem[] {
    return this._items;
  }

  public get totalAmount(): number {
    return this._totalAmount;
  }

  public get status(): OrderStatus {
    return this._status;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public toJSON(): OrderProps {
    return {
      id: this._id,
      customerId: this._customerId,
      items: [...this._items],
      totalAmount: this._totalAmount,
      status: this._status,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
