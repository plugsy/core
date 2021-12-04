export const nullFilter = <T extends any>(
  item: T | null | undefined
): item is T => {
  return !!item;
};
