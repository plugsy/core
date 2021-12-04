// eslint-disable-next-line @typescript-eslint/ban-types
type DeepPartial<T> = T extends Function
  ? T // eslint-disable-next-line @typescript-eslint/ban-types
  : T extends object
  ? T extends unknown[]
    ? DeepPartial<T[number]>[]
    : { [P in keyof T]?: DeepPartial<T[P]> }
  : T;
