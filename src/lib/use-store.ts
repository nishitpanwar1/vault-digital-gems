import { useEffect, useState } from "react";
import { db, subscribe, type Profile } from "./store";

export function useDB() {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const unsub = subscribe(() => setVersion((v) => v + 1));
    return () => { unsub; };
  }, []);
  return { ...db.get(), _v: version };
}

export function useCurrentUser(): Profile | null {
  const data = useDB();
  if (!data.session_user_id) return null;
  return data.profiles.find((p) => p.id === data.session_user_id) ?? null;
}
