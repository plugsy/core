import { Observable, ReplaySubject } from "rxjs";
import { map, share } from "rxjs/operators";
import { Item } from "./connectors/model";

interface Category {
  name: string;
  items: Item[];
}

export function categoriser(items$: Observable<Item[]>) {
  return items$.pipe(
    map((items) =>
      items
        .reduce<Category[]>((categories, item) => {
          if (!item.category) return categories;
          const existingCategory = categories.find(
            (category) => category.name === item.category
          );
          if (existingCategory) {
            existingCategory.items = [
              ...existingCategory.items,
              item,
            ];
            return categories;
          }
          return [
            ...categories,
            { name: item.category, items: [item] },
          ];
        }, [])
        .map(({ items, ...rest }) => ({
          ...rest,
          items: items.sort((a, b) => {
            if (!a.name) return 1;
            if (!b.name) return -1;
            if (a.name < b.name) {
              return -1;
            }
            if (a.name > b.name) {
              return 1;
            }
            return 0;
          }),
        }))
        .sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        })
    ),
    share({
      connector: () => new ReplaySubject(1),
      resetOnComplete: false,
      resetOnError: false,
      resetOnRefCountZero: true,
    })
  );
}
