import { FormPage } from './FormPage';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ embed?: string }>;
}

export default async function Page({ params, searchParams }: Props) {
  const { id } = await params;
  const { embed } = await searchParams;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const res = await fetch(`${apiUrl}/forms/public/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'system-ui' }}>
        <h1 style={{ fontSize: '24px', color: '#374151' }}>Form not found</h1>
        <p style={{ color: '#6b7280' }}>This form may not exist or is not published.</p>
      </div>
    );
  }

  const json = await res.json();
  const form = json.data;

  return <FormPage form={form} embedded={embed === '1'} />;
}
