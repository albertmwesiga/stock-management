'use client';
import { Topbar } from '@/components/layout/topbar';
import { AllowancesView } from '@/components/AllowancesView';

export default function SalesAllowancesPage() {
  return (
    <div>
      <Topbar title="Allowances" subtitle="Request and track your allowances" />
      <AllowancesView isDirector={false} />
    </div>
  );
}
