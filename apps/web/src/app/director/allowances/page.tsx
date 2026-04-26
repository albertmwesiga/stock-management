'use client';
import { Topbar } from '@/components/layout/topbar';
import { AllowancesView } from '@/components/AllowancesView';

export default function DirectorAllowancesPage() {
  return (
    <div>
      <Topbar title="Allowances Management" subtitle="Approve and manage all allowance requests" />
      <AllowancesView isDirector={true} />
    </div>
  );
}
