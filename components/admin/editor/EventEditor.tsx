'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { EditorInitialData } from '@/lib/admin/editor';
import type { PublicEvent } from '@/types/event';
import { updateEvent } from '@/lib/admin/events';
import { SaveBar } from './SaveBar';
import { PreviewPanel } from './PreviewPanel';
import { GeneralTab } from './tabs/GeneralTab';
import { SectionsTab } from './tabs/SectionsTab';
import { DesignTab } from './tabs/DesignTab';
import { ScheduleTab } from './tabs/ScheduleTab';
import { ImagesTab } from './tabs/ImagesTab';

interface EventEditorProps {
  initialData: EditorInitialData;
}

type TabType = 'general' | 'sections' | 'design' | 'schedule' | 'images';

export function EventEditor({ initialData }: EventEditorProps) {
  const { event, templateData } = initialData;

  // Estado del formulario
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [name, setName] = useState(event.name);
  const [title, setTitle] = useState(event.title);
  const [subtitle, setSubtitle] = useState(event.subtitle || '');
  const [welcomeText, setWelcomeText] = useState(event.welcome_text || '');
  const [type, setType] = useState(event.type);
  const [templateId, setTemplateId] = useState(event.template_id || 'default');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>(
    (event.status as 'draft' | 'published' | 'archived') || 'draft'
  );
  const [date, setDate] = useState(event.date || '');
  const [startTime, setStartTime] = useState(event.start_time || '');
  const [location, setLocation] = useState(event.location || '');
  const [address, setAddress] = useState(event.address || '');
  const [mapsUrl, setMapsUrl] = useState(event.maps_url || '');
  const [wazeUrl, setWazeUrl] = useState(event.waze_url || '');
  const [dressCode, setDressCode] = useState(event.dress_code || '');
  const [giftsText, setGiftsText] = useState(event.gifts_text || '');
  const [memorooUrl, setMemorooUrl] = useState(event.memoroo_url || '');
  const [memorooQrUrl, setMemorooQrUrl] = useState(event.memoroo_qr_url || '');
  const [coverImage, setCoverImage] = useState(event.cover_image || '');

  const [sectionConfig, setSectionConfig] = useState(initialData.sectionConfig);
  const [designConfig, setDesignConfig] = useState(initialData.designConfig);
  const [schedule, setSchedule] = useState(initialData.schedule);

  // Estados de control
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Marcar cambios como dirty
  useEffect(() => {
    setIsDirty(true);
  }, [
    name,
    title,
    subtitle,
    welcomeText,
    type,
    templateId,
    status,
    date,
    startTime,
    location,
    address,
    mapsUrl,
    wazeUrl,
    dressCode,
    giftsText,
    memorooUrl,
    memorooQrUrl,
    coverImage,
    sectionConfig,
    designConfig,
    schedule,
  ]);

  // Reset dirty al cargar inicialmente
  useEffect(() => {
    setIsDirty(false);
  }, []);

  // Proteger contra salida accidental si hay cambios sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Escuchar actualizaciones de altura enviadas desde los modificadores visuales del iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'UPDATE_SECTION_HEIGHT' && e.data?.sectionId) {
        handleUpdateSectionHeight(e.data.sectionId, e.data.height);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleUpdateSectionHeight = (sectionId: string, height: number) => {
    setDesignConfig((prev) => ({
      ...prev,
      layout: {
        ...(prev.layout || {}),
        sectionHeights: {
          ...(prev.layout?.sectionHeights || {}),
          [sectionId]: height,
        },
      },
    }));
    setIsDirty(true);
  };

  const handleSave = async (targetStatus?: 'draft' | 'published' | 'archived') => {
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    const finalStatus = targetStatus || status;

    const res = await updateEvent({
      id: event.id,
      name: name.trim(),
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      welcomeText: welcomeText.trim() || undefined,
      type,
      templateId,
      status: finalStatus,
      date: date || undefined,
      startTime: startTime || undefined,
      location: location.trim() || undefined,
      address: address.trim() || undefined,
      mapsUrl: mapsUrl.trim() || undefined,
      wazeUrl: wazeUrl.trim() || undefined,
      dressCode: dressCode.trim() || undefined,
      giftsText: giftsText.trim() || undefined,
      memorooUrl: memorooUrl.trim() || undefined,
      memorooQrUrl: memorooQrUrl.trim() || undefined,
      coverImage: coverImage.trim() || undefined,
      sectionConfig,
      designConfig,
      schedule,
    });

    if (res.success) {
      if (targetStatus) setStatus(targetStatus);
      setIsDirty(false);
      setSaveSuccess(true);
      setRefreshKey((prev) => prev + 1);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setErrorMessage(res.error || 'Ocurrió un error al guardar los cambios.');
    }
    setIsSaving(false);
  };

  const handlePublishToggle = async () => {
    if (status === 'published') {
      const confirmUnpublish = window.confirm(
        '¿Estás seguro de que deseás despublicar este evento? La invitación ya no estará accesible públicamente para los invitados.'
      );
      if (!confirmUnpublish) return;
      await handleSave('draft');
    } else {
      // Validaciones críticas de publicación (Punto 20 del Hito 7)
      if (!name.trim()) {
        setErrorMessage('El nombre del evento es obligatorio para poder publicarlo.');
        setActiveTab('general');
        return;
      }
      if (!title.trim()) {
        setErrorMessage('El título de la invitación es obligatorio para poder publicarlo.');
        setActiveTab('general');
        return;
      }
      if (!date) {
        setErrorMessage('Es necesario configurar la fecha del evento antes de publicarlo.');
        setActiveTab('general');
        return;
      }

      await handleSave('published');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Barra de Guardado Superior */}
      <SaveBar
        eventId={event.id}
        eventName={name || 'Evento'}
        slug={event.slug}
        status={status}
        isDirty={isDirty}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
        onSave={() => handleSave()}
        onPublishToggle={handlePublishToggle}
      />

      {errorMessage && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, borderBottom: '1px solid #fca5a5' }}>
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Editor Body: 3-Zone Layout en Desktop */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 480px) 1fr',
          gap: '1.5rem',
          padding: '1.5rem',
          maxWidth: '1800px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Zona Izquierda: Pestañas de Configuración */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '1rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Navegación por pestañas */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc',
              overflowX: 'auto',
            }}
          >
            {[
              { id: 'general', label: 'General', icon: '📝' },
              { id: 'sections', label: 'Secciones', icon: '☰' },
              { id: 'design', label: 'Diseño', icon: '🎨' },
              { id: 'schedule', label: 'Cronograma', icon: '⏰' },
              { id: 'images', label: 'Imágenes', icon: '📸' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                style={{
                  padding: '0.85rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #9333ea' : '2px solid transparent',
                  background: activeTab === tab.id ? '#ffffff' : 'transparent',
                  color: activeTab === tab.id ? '#9333ea' : '#64748b',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          {/* Contenido del Tab Activo */}
          <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: 'calc(100vh - 180px)' }}>
            {activeTab === 'general' && (
              <GeneralTab
                name={name}
                setName={setName}
                title={title}
                setTitle={setTitle}
                subtitle={subtitle}
                setSubtitle={setSubtitle}
                welcomeText={welcomeText}
                setWelcomeText={setWelcomeText}
                type={type}
                setType={setType}
                templateId={templateId}
                setTemplateId={setTemplateId}
                date={date}
                setDate={setDate}
                startTime={startTime}
                setStartTime={setStartTime}
                location={location}
                setLocation={setLocation}
                address={address}
                setAddress={setAddress}
                mapsUrl={mapsUrl}
                setMapsUrl={setMapsUrl}
                wazeUrl={wazeUrl}
                setWazeUrl={setWazeUrl}
                dressCode={dressCode}
                setDressCode={setDressCode}
                giftsText={giftsText}
                setGiftsText={setGiftsText}
              />
            )}

            {activeTab === 'sections' && (
              <SectionsTab
                sectionConfig={sectionConfig}
                setSectionConfig={setSectionConfig}
                supportedSections={templateData.supportedSections}
              />
            )}

            {activeTab === 'design' && (
              <DesignTab
                designConfig={designConfig}
                setDesignConfig={setDesignConfig}
                baseTheme={templateData.theme}
                presets={templateData.colorPresets}
              />
            )}

            {activeTab === 'schedule' && (
              <ScheduleTab schedule={schedule} setSchedule={setSchedule} />
            )}

            {activeTab === 'images' && (
              <ImagesTab
                eventId={event.id}
                coverImage={coverImage}
                setCoverImage={setCoverImage}
                memorooUrl={memorooUrl}
                setMemorooUrl={setMemorooUrl}
                memorooQrUrl={memorooQrUrl}
                setMemorooQrUrl={setMemorooQrUrl}
                sectionConfig={sectionConfig}
                setSectionConfig={setSectionConfig}
              />
            )}
          </div>
        </div>

        {/* Zona Derecha: Panel de Previsualización Interactivo */}
        <div style={{ height: 'calc(100vh - 120px)', position: 'sticky', top: '80px' }}>
          <PreviewPanel
            slug={event.slug}
            refreshKey={refreshKey}
            liveData={{
              id: event.id,
              slug: event.slug,
              name,
              title,
              subtitle: subtitle || undefined,
              welcomeText: welcomeText || undefined,
              type,
              templateId,
              status,
              date: date || undefined,
              startTime: startTime || undefined,
              location: location || undefined,
              address: address || undefined,
              mapsUrl: mapsUrl || undefined,
              wazeUrl: wazeUrl || undefined,
              dressCode: dressCode || undefined,
              giftsText: giftsText || undefined,
              memorooUrl: memorooUrl || undefined,
              memorooQrUrl: memorooQrUrl || undefined,
              coverImage: coverImage || undefined,
              sectionConfig,
              designConfig,
              schedule,
            }}
            onUpdateSectionHeight={handleUpdateSectionHeight}
          />
        </div>
      </div>
    </div>
  );
}
