import { PathLike, watch, WatchOptions } from "fs";
import { Observable } from "rxjs";

/**
 * Watch for changes on `filename`, where `filename` is either a file or a directory, returning an Observable stream.
 * @param filename A path to a file or directory. If a URL is provided, it must use the `file:` protocol.
 * URL support is _experimental_.
 */
export function fileWatchObservable(
  filename: PathLike
): Observable<[string, string]>;

/**
 * Watch for changes on `filename`, where `filename` is either a file or a directory, returning an Observable stream.
 * @param filename A path to a file or directory. If a URL is provided, it must use the `file:` protocol.
 * URL support is _experimental_.
 * @param options Either the encoding for the filename provided to the listener, or an object optionally specifying encoding, persistent, and recursive options.
 * If `encoding` is not supplied, the default of `'utf8'` is used.
 * If `persistent` is not supplied, the default of `true` is used.
 * If `recursive` is not supplied, the default of `false` is used.
 */
export function fileWatchObservable(
  filename: PathLike,
  options:
    | { encoding: "buffer"; persistent?: boolean; recursive?: boolean }
    | "buffer"
): Observable<[string, Buffer]>;

/**
 * Watch for changes on `filename`, where `filename` is either a file or a directory, returning an Observable stream.
 * @param filename A path to a file or directory. If a URL is provided, it must use the `file:` protocol.
 * URL support is _experimental_.
 * @param options Either the encoding for the filename provided to the listener, or an object optionally specifying encoding, persistent, and recursive options.
 * If `encoding` is not supplied, the default of `'utf8'` is used.
 * If `persistent` is not supplied, the default of `true` is used.
 * If `recursive` is not supplied, the default of `false` is used.
 */
export function fileWatchObservable(
  filename: PathLike,
  options?: WatchOptions | string
): Observable<[string, string | Buffer]> {
  return new Observable((subscriber) => {
    const watcher = watch(
      filename,
      options ?? {},
      (eventType: string, filename: string | Buffer) => {
        subscriber.next([eventType, filename]);
      }
    );

    watcher.on("error", (error: Error) => {
      subscriber.error(error);
    });

    watcher.on("close", () => {
      subscriber.complete();
    });

    return function unsubscribe() {
      watcher.close();
    };
  });
}
