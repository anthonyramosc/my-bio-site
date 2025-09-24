import React, { useState, useEffect } from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { useTemplates } from '../../../../hooks/useTemplates';

export interface Platilla {
    id: string;
    name?: string;
    description?: string;
    previewUrl?: string;
    index?: number;
    config: any;
    isActive?: boolean;
}

interface TemplateSelectorProps {
    currentThemeId: string;
    onTemplateChange: (templateId: string) => void;
    loading?: boolean;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
                                                               currentThemeId,
                                                               onTemplateChange,
                                                               loading = false
                                                           }) => {
    const { templates, loading: loadingTemplates, error, refetch } = useTemplates();
    const [selectedTemplate, setSelectedTemplate] = useState<string>(currentThemeId);
    const [validationError, setValidationError] = useState<string>('');

    useEffect(() => {
        // Validate that the current theme ID exists in available templates
        if (currentThemeId && templates.length > 0) {
            const templateExists = templates.some(template => template.id === currentThemeId);
            if (!templateExists) {
                console.warn(`Current theme ID ${currentThemeId} not found in available templates`);
                // Set to first available template as fallback
                const firstTemplate = templates[0];
                if (firstTemplate) {
                    setSelectedTemplate(firstTemplate.id);
                    setValidationError('La plantilla actual no está disponible. Se ha seleccionado una plantilla por defecto.');
                }
            } else {
                setSelectedTemplate(currentThemeId);
                setValidationError('');
            }
        }
    }, [currentThemeId, templates]);

    const handleRetry = () => {
        setValidationError('');
        refetch();
    };

    const handleTemplateSelect = (templateId: string) => {
        if (loading || templateId === selectedTemplate) return;

        // Validate template exists before proceeding
        const templateExists = templates.some(template => template.id === templateId);
        if (!templateExists) {
            setValidationError('La plantilla seleccionada no es válida.');
            return;
        }

        console.log('Template selected:', templateId);
        console.log('Available templates:', templates.map(t => ({ id: t.id, name: t.name })));

        setSelectedTemplate(templateId);
        setValidationError('');
        onTemplateChange(templateId);
    };

    // Validation error state
    if (validationError) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                    <div className="text-sm">
                        <p className="text-yellow-800 font-medium">Advertencia de plantilla</p>
                        <p className="text-yellow-700 text-xs mt-1">{validationError}</p>
                    </div>
                </div>
                {/* Still show template selection */}
                {templates.length > 0 && (
                    <div className="flex gap-4 justify-start">
                        {templates.slice(0, 3).map((template) => {
                            const isSelected = selectedTemplate === template.id;
                            return (
                                <div
                                    key={template.id}
                                    className={`
                                        relative w-24 h-40 rounded-lg overflow-hidden cursor-pointer
                                        transition-all duration-200 transform border-2
                                        ${isSelected
                                        ? 'border-blue-500 shadow-lg scale-105 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300 hover:scale-102 hover:shadow-md bg-white'
                                    }
                                    `}
                                    onClick={() => handleTemplateSelect(template.id)}
                                >
                                    <div className="w-full h-full flex flex-col">
                                        {template.previewUrl ? (
                                            <img
                                                src={template.previewUrl}
                                                alt={template.name || 'Template preview'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
                                                <div className="text-center p-2">
                                                    <div className="w-4 h-4 bg-gray-400 rounded-full mx-auto mb-1"></div>
                                                    <div className="w-8 h-1 bg-gray-400 rounded mx-auto mb-1"></div>
                                                    <div className="w-6 h-1 bg-gray-400 rounded mx-auto"></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {isSelected && (
                                        <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // Error state
    if (error && !loadingTemplates) {
        return (
            <div className="text-center py-8">
                <div className="text-red-500 mb-4">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Error al cargar las plantillas</p>
                    <p className="text-xs text-gray-500 mt-1">{error}</p>
                </div>
                <button
                    onClick={handleRetry}
                    className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Intentar de nuevo
                </button>
            </div>
        );
    }

    // Loading state
    if (loadingTemplates) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500 mr-2" />
                    <span className="text-sm text-gray-500">Cargando plantillas...</span>
                </div>
                <div className="flex gap-4 justify-center">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-24 h-40 bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    // Empty state
    if (templates.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">No hay plantillas disponibles</p>
                <button
                    onClick={handleRetry}
                    className="mt-2 px-4 py-2 bg-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                >
                    Recargar
                </button>
            </div>
        );
    }

    const limitedTemplates = templates.slice(0, 3);

    return (
        <div className="space-y-4">
            <div className="flex gap-4 justify-start">
                {limitedTemplates.map((template) => {
                    const isSelected = selectedTemplate === template.id;
                    const isLoading = loading && isSelected;

                    return (
                        <div
                            key={template.id}
                            className={`
                                relative w-24 h-40 rounded-lg overflow-hidden cursor-pointer
                                transition-all duration-200 transform border-2
                                ${isSelected
                                ? 'border-blue-500 shadow-lg scale-105 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 hover:scale-102 hover:shadow-md bg-white'
                            }
                                ${loading ? 'opacity-75' : ''}
                                ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
                            `}
                            onClick={() => !isLoading && handleTemplateSelect(template.id)}
                        >
                            {/* Template preview */}
                            <div className="w-full h-full flex flex-col">
                                {template.previewUrl ? (
                                    <div className="flex-1 relative">
                                        <img
                                            src={template.previewUrl}
                                            alt={template.name || 'Template preview'}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.currentTarget;
                                                target.style.display = 'none';
                                                const fallback = target.nextElementSibling as HTMLElement;
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                        />
                                        {/* Fallback placeholder (hidden by default) */}
                                        <div
                                            className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center"
                                            style={{ display: 'none' }}
                                        >
                                            <div className="text-center p-2">
                                                <div className="w-4 h-4 bg-gray-400 rounded-full mx-auto mb-1"></div>
                                                <div className="w-8 h-1 bg-gray-400 rounded mx-auto mb-1"></div>
                                                <div className="w-6 h-1 bg-gray-400 rounded mx-auto"></div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // Default placeholder when no preview URL
                                    <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
                                        <div className="text-center p-2">
                                            <div className="w-4 h-4 bg-gray-400 rounded-full mx-auto mb-1"></div>
                                            <div className="w-8 h-1 bg-gray-400 rounded mx-auto mb-1"></div>
                                            <div className="w-6 h-1 bg-gray-400 rounded mx-auto"></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Selection indicator */}
                            {isSelected && (
                                <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                            )}

                            {/* Loading overlay */}
                            {isLoading && (
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-sm">
                                    <div className="bg-white/90 rounded-full p-1">
                                        <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                                    </div>
                                </div>
                            )}

                            {/* Hover effect indicator */}
                            {!isSelected && !loading && (
                                <div className="absolute inset-0 bg-blue-500/0 hover:bg-blue-500/10 transition-colors duration-200" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Template name below */}
            <div className="text-center">
                <p className="text-xs text-gray-600 font-medium">
                    {limitedTemplates.find(t => t.id === selectedTemplate)?.name || 'Plantilla Seleccionada'}
                </p>
            </div>
        </div>
    );
};

export default TemplateSelector;