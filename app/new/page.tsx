import { Suspense } from "react";
import NewDecisionClient from "./NewDecisionClient";

export default function NewDecisionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <NewDecisionClient />
    </Suspense>
  );
}
