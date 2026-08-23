import { Suspense } from "react";
import { LocateClient } from "./LocateClient";

export default function LocatePage() {
  return (
    <Suspense fallback={null}>
      <LocateClient />
    </Suspense>
  );
}
