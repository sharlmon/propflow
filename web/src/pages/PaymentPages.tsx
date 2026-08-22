import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiRequest } from '../api/client';
import type { Payment, Tenancy } from '../api/types';
import { Button } from '../components/ui/Button';

const money = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  maximumFractionDigits: 0,
});
export function PaymentsPage() {
  const client = useQueryClient();
  const [show, setShow] = useState(false);
  const payments = useQuery({
    queryKey: ['payments'],
    queryFn: ({ signal }) => apiRequest<Payment[]>('/payments', { signal }),
  });
  const tenancies = useQuery({
    queryKey: ['tenancies'],
    queryFn: ({ signal }) => apiRequest<Tenancy[]>('/tenancies', { signal }),
    enabled: show,
  });
  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => apiRequest('/payments', { method: 'POST', body }),
    onSuccess: async () => {
      setShow(false);
      await client.invalidateQueries({ queryKey: ['payments'] });
    },
  });
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    create.mutate({ ...values, amount: Number(values.amount), status: 'recorded' });
  }
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Demo ledger</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Rent payments</h1>
          <p className="mt-2 text-slate-600">
            Record received rent. “M-Pesa demo” is simulated and does not transfer money.
          </p>
        </div>
        <Button onClick={() => setShow((value) => !value)}>{show ? 'Cancel' : 'Record payment'}</Button>
      </div>
      {show ? (
        <form onSubmit={submit} className="mt-7 grid gap-4 rounded-2xl border bg-white p-6 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-semibold">Tenancy</span>
            <select name="tenancy_id" required className="min-h-11 w-full rounded-xl border bg-white px-3">
              <option value="">Choose tenancy</option>
              {tenancies.data
                ?.filter((item) => item.status === 'active')
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.property_name} · {item.unit_label} · {item.tenant_name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold">Amount (KES)</span>
            <input
              name="amount"
              type="number"
              min="1"
              required
              className="min-h-11 w-full rounded-xl border px-3"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold">Method</span>
            <select name="method" className="min-h-11 w-full rounded-xl border bg-white px-3">
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="mpesa_demo">M-Pesa demo (simulated)</option>
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold">Reference</span>
            <input name="reference" required className="min-h-11 w-full rounded-xl border px-3" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold">Payment date</span>
            <input name="paid_at" type="date" required className="min-h-11 w-full rounded-xl border px-3" />
          </label>
          {create.isError ? (
            <p role="alert" className="sm:col-span-2 text-red-700">
              {create.error.message}
            </p>
          ) : null}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Recording…' : 'Record ledger payment'}
            </Button>
          </div>
        </form>
      ) : null}
      <div className="mt-7">
        {payments.isLoading ? (
          <div className="h-48 animate-pulse rounded-2xl bg-white" />
        ) : payments.isError ? (
          <div role="alert" className="rounded-xl bg-red-50 p-4">
            {payments.error.message}
          </div>
        ) : payments.data?.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-white p-10 text-center">
            No ledger entries yet.
          </div>
        ) : (
          <PaymentTable payments={payments.data || []} />
        )}
      </div>
    </section>
  );
}

export function PaymentTable({ payments }: { payments: Payment[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border bg-white">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-4">Date</th>
            <th className="p-4">Home</th>
            <th className="p-4">Tenant</th>
            <th className="p-4">Amount</th>
            <th className="p-4">Method</th>
            <th className="p-4">Reference</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id} className="border-t">
              <td className="p-4">{new Date(payment.paid_at).toLocaleDateString('en-KE')}</td>
              <td className="p-4 font-semibold">
                {payment.property_name} · {payment.unit_label}
              </td>
              <td className="p-4">{payment.tenant_name}</td>
              <td className="p-4 font-semibold text-emerald-700">{money.format(payment.amount)}</td>
              <td className="p-4">
                {payment.method === 'mpesa_demo' ? 'M-Pesa demo (simulated)' : payment.method}
              </td>
              <td className="p-4 font-mono text-xs">{payment.reference}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
