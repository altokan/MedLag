
export enum CurrencyType {
  OLD = 'OLD',
  NEW = 'NEW'
}

export interface CalculationResult {
  value: number;
  isError: boolean;
  message?: string;
}
