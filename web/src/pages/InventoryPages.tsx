import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, ChevronRight, Home, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { apiRequest, ApiError } from '../api/client';
import type { Property, PropertyDetail, Unit } from '../api/types';
import { Button } from '../components/ui/Button';
import { FormField } from '../components/ui/FormField';

const propertySchema = z.object({
  name: z.string().min(2, 'Enter a property name.'),
  description: z.string(),
  address_line: z.string().min(1, 'Enter an address.'),
  locality: z.string().min(1, 'Enter a locality.'),
  county: z.string().min(1, 'Enter a county.'),
  status: z.enum(['active', 'inactive']),
});
const unitSchema = z.object({
  unit_label: z.string().min(1, 'Enter a unit label.'),
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().positive().max(20),
  rent_amount: z.number().min(0),
  deposit_amount: z.number().min(0),
  availability_status: z.enum(['available', 'occupied', 'unavailable']),
});
type PropertyValues = z.infer<typeof propertySchema>;
type UnitValues = z.infer<typeof unitSchema>;

function PageError({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-900">
      <p>{error instanceof Error ? error.message : 'Unable to load this page.'}</p>
      <button className="mt-3 font-semibold underline" onClick={retry}>
        Try again
      </button>
    </div>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-10 text-center text-slate-600">
      {children}
    </div>
  );
}

export function PropertiesPage() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['properties'],
    queryFn: ({ signal }) => apiRequest<Property[]>('/properties', { signal }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => apiRequest<void>(`/properties/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['properties'] }),
  });
  async function removeProperty(property: Property) {
    if (
      window.confirm(`Delete ${property.name}? This is only allowed when it has no units or active tenancy.`)
    )
      await remove.mutateAsync(property.id);
  }
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Portfolio</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Properties</h1>
          <p className="mt-2 text-slate-600">Manage each building and its rentable units.</p>
        </div>
        <Link
          to="/landlord/properties/new"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white"
        >
          <Plus size={18} />
          Add property
        </Link>
      </div>
      <div className="mt-8">
        {query.isLoading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-white" aria-label="Loading properties" />
        ) : query.isError ? (
          <PageError error={query.error} retry={() => query.refetch()} />
        ) : query.data?.length === 0 ? (
          <Empty>No properties yet. Add your first property to start managing units.</Empty>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {query.data?.map((property) => (
              <article key={property.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-700">
                    <Building2 />
                  </span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                    {property.status}
                  </span>
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-950">{property.name}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {property.locality}, {property.county}
                </p>
                <dl className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4">
                  <div>
                    <dt className="text-xs text-slate-500">Units</dt>
                    <dd className="font-bold">{property.unit_count}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Available</dt>
                    <dd className="font-bold">{property.available_units}</dd>
                  </div>
                </dl>
                <div className="mt-5 flex items-center justify-between">
                  <button
                    onClick={() => removeProperty(property)}
                    disabled={remove.isPending}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                  <Link
                    className="inline-flex items-center gap-1 font-semibold text-blue-700"
                    to={`/landlord/properties/${property.id}`}
                  >
                    Manage <ChevronRight size={17} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      {remove.error ? (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-red-800">
          {remove.error.message}
        </p>
      ) : null}
    </section>
  );
}

export function NewPropertyPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const form = useForm<PropertyValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: '',
      description: '',
      address_line: '',
      locality: '',
      county: 'Nairobi',
      status: 'active',
    },
  });
  async function submit(values: PropertyValues) {
    setServerError('');
    try {
      const created = await apiRequest<Property>('/properties', { method: 'POST', body: values });
      navigate(`/landlord/properties/${created.id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        Object.entries(error.fields).forEach(([field, message]) =>
          form.setError(field as keyof PropertyValues, { message }),
        );
        setServerError(error.message);
      }
    }
  }
  return (
    <section>
      <Link to="/landlord/properties" className="text-sm font-semibold text-blue-700">
        ← Properties
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-slate-950">Add property</h1>
      <div className="mt-7 max-w-2xl rounded-2xl border bg-white p-6">
        <PropertyForm form={form} onSubmit={submit} serverError={serverError} submitLabel="Create property" />
      </div>
    </section>
  );
}

function PropertyForm({
  form,
  onSubmit,
  serverError,
  submitLabel,
}: {
  form: UseFormReturn<PropertyValues>;
  onSubmit: (values: PropertyValues) => Promise<void>;
  serverError: string;
  submitLabel: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;
  return (
    <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError ? (
        <p role="alert" className="sm:col-span-2 rounded-xl bg-red-50 p-3 text-red-800">
          {serverError}
        </p>
      ) : null}
      <div className="sm:col-span-2">
        <FormField label="Property name" {...register('name')} error={errors.name?.message} />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-2 block text-sm font-semibold" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          className="min-h-28 w-full rounded-xl border p-3"
          {...register('description')}
        />
      </div>
      <div className="sm:col-span-2">
        <FormField
          label="Street address"
          {...register('address_line')}
          error={errors.address_line?.message}
        />
      </div>
      <FormField label="Locality" {...register('locality')} error={errors.locality?.message} />
      <FormField label="County" {...register('county')} error={errors.county?.message} />
      <div>
        <label className="mb-2 block text-sm font-semibold" htmlFor="status">
          Status
        </label>
        <select
          id="status"
          className="min-h-11 w-full rounded-xl border bg-white px-3"
          {...register('status')}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export function PropertyDetailPage() {
  const { propertyId = '' } = useParams();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Unit | null>(null);
  const [notice, setNotice] = useState('');
  const query = useQuery({
    queryKey: ['property', propertyId],
    queryFn: ({ signal }) => apiRequest<PropertyDetail>(`/properties/${propertyId}`, { signal }),
    enabled: Boolean(propertyId),
  });
  const propertyForm = useForm<PropertyValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: '',
      description: '',
      address_line: '',
      locality: '',
      county: '',
      status: 'active',
    },
  });
  const unitForm = useForm<UnitValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      unit_label: '',
      bedrooms: 1,
      bathrooms: 1,
      rent_amount: 0,
      deposit_amount: 0,
      availability_status: 'available',
    },
  });
  useEffect(() => {
    if (query.data) propertyForm.reset(query.data.property);
  }, [query.data, propertyForm]);
  async function saveProperty(values: PropertyValues) {
    await apiRequest(`/properties/${propertyId}`, { method: 'PATCH', body: values });
    setNotice('Property updated.');
    await queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
    await queryClient.invalidateQueries({ queryKey: ['properties'] });
  }
  async function saveUnit(values: UnitValues) {
    if (editing) await apiRequest(`/units/${editing.id}`, { method: 'PATCH', body: values });
    else await apiRequest(`/properties/${propertyId}/units`, { method: 'POST', body: values });
    setEditing(null);
    unitForm.reset({
      unit_label: '',
      bedrooms: 1,
      bathrooms: 1,
      rent_amount: 0,
      deposit_amount: 0,
      availability_status: 'available',
    });
    setNotice(editing ? 'Unit updated.' : 'Unit added.');
    await queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
  }
  function editUnit(unit: Unit) {
    setEditing(unit);
    unitForm.reset(unit);
  }
  async function deleteUnit(unit: Unit) {
    if (!window.confirm(`Delete unit ${unit.unit_label}?`)) return;
    await apiRequest(`/units/${unit.id}`, { method: 'DELETE' });
    await queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
  }
  async function changePublication(unit: Unit) {
    let listingId = unit.listing_id;
    if (!listingId) {
      const created = await apiRequest<{ id: string }>(`/units/${unit.id}/listing`, {
        method: 'POST',
        body: {
          title: `${p.name} · Unit ${unit.unit_label}`,
          description: p.description || `A well-managed rental home in ${p.locality}.`,
          rent_amount: unit.rent_amount,
          deposit_amount: unit.deposit_amount,
          amenities: [],
        },
      });
      listingId = created.id;
    }
    const action = unit.listing_status === 'published' ? 'unpublish' : 'publish';
    await apiRequest(`/listings/${listingId}/${action}`, { method: 'POST' });
    setNotice(action === 'publish' ? 'Listing published to FindYourKeja.' : 'Listing unpublished.');
    await queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
    await queryClient.invalidateQueries({ queryKey: ['listings'] });
  }
  if (query.isLoading) return <div className="h-64 animate-pulse rounded-2xl bg-white" />;
  if (query.isError) return <PageError error={query.error} retry={() => query.refetch()} />;
  if (!query.data) return null;
  const p = query.data.property;
  return (
    <section>
      <Link to="/landlord/properties" className="text-sm font-semibold text-blue-700">
        ← Properties
      </Link>
      <div className="mt-4 flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-xl bg-blue-100 text-blue-700">
          <Home />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-slate-950">{p.name}</h1>
          <p className="text-slate-600">
            {p.locality}, {p.county}
          </p>
        </div>
      </div>
      {notice ? (
        <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-3 text-emerald-800">
          {notice}
        </p>
      ) : null}
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-bold">Property details</h2>
          <div className="mt-5">
            <PropertyForm
              form={propertyForm}
              onSubmit={saveProperty}
              serverError=""
              submitLabel="Save changes"
            />
          </div>
        </article>
        <article className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-bold">{editing ? `Edit unit ${editing.unit_label}` : 'Add a unit'}</h2>
          <UnitForm
            form={unitForm}
            onSubmit={saveUnit}
            editing={Boolean(editing)}
            onCancel={() => {
              setEditing(null);
              unitForm.reset();
            }}
          />
        </article>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-slate-950">Units</h2>
        {query.data.units.length === 0 ? (
          <div className="mt-4">
            <Empty>No units yet. Add the first rentable unit above.</Empty>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border bg-white">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-4">Unit</th>
                  <th className="p-4">Layout</th>
                  <th className="p-4">Monthly rent</th>
                  <th className="p-4">Availability</th>
                  <th className="p-4">Listing</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {query.data.units.map((unit) => (
                  <tr key={unit.id} className="border-t">
                    <td className="p-4 font-semibold">{unit.unit_label}</td>
                    <td className="p-4">
                      {unit.bedrooms} bed · {unit.bathrooms} bath
                    </td>
                    <td className="p-4">KES {unit.rent_amount.toLocaleString()}</td>
                    <td className="p-4">{unit.availability_status}</td>
                    <td className="p-4">{unit.listing_status || 'not listed'}</td>
                    <td className="p-4">
                      <button className="mr-3 font-semibold text-blue-700" onClick={() => editUnit(unit)}>
                        Edit
                      </button>
                      <button
                        className="mr-3 font-semibold text-blue-700"
                        disabled={unit.availability_status !== 'available'}
                        onClick={() => changePublication(unit)}
                      >
                        {unit.listing_status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button className="font-semibold text-red-700" onClick={() => deleteUnit(unit)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function UnitForm({
  form,
  onSubmit,
  editing,
  onCancel,
}: {
  form: UseFormReturn<UnitValues>;
  onSubmit: (values: UnitValues) => Promise<void>;
  editing: boolean;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;
  return (
    <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField label="Unit label" {...register('unit_label')} error={errors.unit_label?.message} />
      <FormField
        label="Bedrooms"
        type="number"
        min="0"
        {...register('bedrooms', { valueAsNumber: true })}
        error={errors.bedrooms?.message}
      />
      <FormField
        label="Bathrooms"
        type="number"
        min="0.5"
        step="0.5"
        {...register('bathrooms', { valueAsNumber: true })}
        error={errors.bathrooms?.message}
      />
      <FormField
        label="Monthly rent (KES)"
        type="number"
        min="0"
        {...register('rent_amount', { valueAsNumber: true })}
        error={errors.rent_amount?.message}
      />
      <FormField
        label="Deposit (KES)"
        type="number"
        min="0"
        {...register('deposit_amount', { valueAsNumber: true })}
        error={errors.deposit_amount?.message}
      />
      <div>
        <label className="mb-2 block text-sm font-semibold" htmlFor="availability">
          Availability
        </label>
        <select
          id="availability"
          className="min-h-11 w-full rounded-xl border bg-white px-3"
          {...register('availability_status')}
        >
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </div>
      <div className="flex gap-3 sm:col-span-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : editing ? 'Save unit' : 'Add unit'}
        </Button>
        {editing ? (
          <button type="button" className="rounded-xl px-4 font-semibold text-slate-600" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
