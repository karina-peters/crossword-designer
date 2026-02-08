export enum EditMode {
  Value,
  Spacer,
  Circle,
  Shade,
}

export enum ViewMode {
  Across,
  Down,
  Intersect,
}

export interface Filter {
  length: number | null;
  contains: string | null;
}
