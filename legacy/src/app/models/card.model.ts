export interface MetricCard {
  id: string;
  title: string;
  metricType: MetricType;
  value: any;
  progress?: number;
  status?: MetricStatus;
}

export interface PuzzleCard {
  id: string;
  name: string;
  owner: string;
  lastEdited: Date;
  width: number;
  height: number;
  locked: boolean;
  public: boolean;
}

export interface CardConfig {
  readonly: boolean;
  showOwner: boolean;
}

export enum MetricType {
  Text,
  Check,
  Percent,
  Number,
}

export enum MetricStatus {
  None = "None",
  Success = "Success",
  Warning = "Warning",
  Danger = "Danger",
}
