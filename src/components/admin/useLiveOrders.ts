"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderView } from "@/lib/types";

const POLL_MS = 3000;

/** Polls the admin feed. Returns orders plus the ids that arrived since the page opened. */
export function useLiveOrders(initial: OrderView[]) {
  const [orders, setOrders] = useState(initial);
  const [fresh, setFresh] = useState<Set<number>>(new Set());
  const known = useRef(new Set(initial.map((o) => o.id)));
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const json = await res.json();
      if (!json.ok) return;
      const list = json.orders as OrderView[];
      const arrived = list.filter((o) => !known.current.has(o.id)).map((o) => o.id);
      for (const id of arrived) known.current.add(id);
      if (arrived.length > 0) setFresh((prev) => new Set([...prev, ...arrived]));
      setOrders(list);
    } catch {
      /* network blip: next tick retries */
    }
  }, [router]);

  useEffect(() => {
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  const acknowledge = useCallback((id: number) => {
    setFresh((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  return { orders, setOrders, fresh, acknowledge, refresh };
}
