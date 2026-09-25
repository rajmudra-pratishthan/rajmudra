import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

// ─── AUTH CONTEXT ────────────────────────────────────────────────────────────
type AuthCtx = { session: Session | null; loading: boolean; signOut: () => Promise<void> };
const AuthContext = createContext<AuthCtx>({ session: null, loading: true, signOut: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: sub } = supabase?.auth.onAuthStateChange((_e, s) => setSession(s)) ?? { data: null };
    return () => sub?.subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => { await supabase?.auth.signOut(); }, []);
  return <AuthContext.Provider value={{ session, loading, signOut }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);

// ─── TOAST ───────────────────────────────────────────────────────────────────
type Toast = { id: number; type: 'success' | 'error' | 'info'; message: string };
type ToastCtx = { toast: (type: Toast['type'], message: string) => void };
const ToastContext = createContext<ToastCtx>({ toast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);
  const toast = useCallback((type: Toast['type'], message: string) => {
    const id = ++counter.current;
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  const icons = { success: <CheckCircle size={16} />, error: <AlertTriangle size={16} />, info: <Info size={16} /> };
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {icons[t.type]}{t.message}
            <button onClick={() => setToasts((x) => x.filter((i) => i.id !== t.id))} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><X size={14} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
export const useToast = () => useContext(ToastContext);

// ─── CONFIRM DIALOG ──────────────────────────────────────────────────────────
type ConfirmOpts = { title: string; message: string; danger?: boolean };
type ConfirmCtx = { confirm: (opts: ConfirmOpts) => Promise<boolean> };
const ConfirmContext = createContext<ConfirmCtx>({ confirm: async () => false });

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<(ConfirmOpts & { resolve: (v: boolean) => void }) | null>(null);
  const confirm = useCallback((opts: ConfirmOpts) => new Promise<boolean>((resolve) => setState({ ...opts, resolve })), []);
  const handle = (v: boolean) => { state?.resolve(v); setState(null); };
  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <div className="modal-overlay" onClick={() => handle(false)}>
          <div className="modal confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body">
              <AlertTriangle size={36} />
              <h3>{state.title}</h3>
              <p>{state.message}</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => handle(false)}>Cancel</button>
              <button className={`btn ${state.danger ? 'btn-danger' : 'btn-primary'}`} onClick={() => handle(true)}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
export const useConfirm = () => useContext(ConfirmContext);

// ─── ACTIVITY LOG ────────────────────────────────────────────────────────────
export async function logActivity(action: string, entityType?: string, entityId?: string, details?: object) {
  const { data: { session } } = await supabase!.auth.getSession();
  await supabase?.from('admin_activity_logs').insert({ admin_id: session?.user.id, action, entity_type: entityType, entity_id: entityId, details });
}

// ─── PAGINATION HOOK ─────────────────────────────────────────────────────────
export function usePagination(total: number, perPage = 20) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  return { page, setPage, totalPages, from, to };
}
