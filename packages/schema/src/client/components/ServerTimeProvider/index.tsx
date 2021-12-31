import {
  useCallback,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import { useHarmonicIntervalFn } from "react-use";
import differenceInMilliseconds from "date-fns/differenceInMilliseconds";
import parseISO from "date-fns/parseISO";
import addMilliseconds from "date-fns/addMilliseconds";
import type { PlugsyComponent } from "../../types";
import {
  ServerTimeDocument,
  ServerTimeQuery,
  useSubscribeToServerTimeSubscription,
} from "./server-time.generated.graphql";

const ServerTimeContext = createContext<Date>(new Date());

export function useServerTime() {
  const serverTime = useContext(ServerTimeContext);
  const [secondsOut, setSecondsOut] = useState(
    differenceInMilliseconds(
      new Date(),
      serverTime
        ? typeof serverTime === "string"
          ? parseISO(serverTime)
          : serverTime
        : new Date()
    )
  );
  const [tempSecondsOut, setTempSecondsOut] = useState(secondsOut);

  useEffect(() => {
    setTempSecondsOut(differenceInMilliseconds(new Date(), serverTime));
  }, [serverTime]);

  useHarmonicIntervalFn(() => {
    setSecondsOut(tempSecondsOut);
  }, 1000);

  const normalisedDate = useCallback(
    (date: Date | string) => {
      return addMilliseconds(
        typeof date === "string" ? parseISO(date) : date,
        secondsOut
      );
    },
    [secondsOut]
  );

  return { secondsOut, normalisedDate };
}

export interface ServerTimeProviderProps {
  serverTime: Date;
}

export const ServerTimeProvider: PlugsyComponent<ServerTimeProviderProps> = ({
  serverTime,
  children,
}) => {
  const { data } = useSubscribeToServerTimeSubscription();
  return (
    <ServerTimeContext.Provider value={data?.serverTime ?? serverTime}>
      {children}
    </ServerTimeContext.Provider>
  );
};

ServerTimeProvider.getServerSideProps = async (apolloClient) => {
  const { data } = await apolloClient.query<ServerTimeQuery>({
    query: ServerTimeDocument,
  });

  return {
    props: {
      serverTime: data.serverTime,
    },
  };
};
