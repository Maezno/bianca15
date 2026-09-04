import { notFound, redirect } from 'next/navigation';
import { getCurrentAdminUser } from '@/lib/admin/auth';
import { getEditorData } from '@/lib/admin/editor';
import { EventEditor } from '@/components/admin/editor/EventEditor';

export const dynamic = 'force-dynamic';

interface EditorPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { eventId } = await params;
  const user = await getCurrentAdminUser();

  if (!user) {
    redirect('/admin/login');
  }

  const editorData = await getEditorData(eventId);

  if (!editorData) {
    notFound();
  }

  return <EventEditor initialData={editorData} />;
}
