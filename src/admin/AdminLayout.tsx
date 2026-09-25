import { type ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode; title?: string }) {
  return <div className="page-wrap">{children}</div>;
}
