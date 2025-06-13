import React, { useState } from 'react';
import { Plus, Trash, Edit, Save, X } from 'lucide-react';
import { useBiositeContext } from '../../../../context/BiositeContext';

interface LinkItem {
    id: string;
    label: string;
    url: string;
    icon: string;
}

const LinksEditor = () => {
    const { links, setLinks } = useBiositeContext();
    
    const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
    const [newLink, setNewLink] = useState<Partial<LinkItem>>({ label: '', url: '', icon: 'link' });
    const [isAddingNew, setIsAddingNew] = useState(false);
    
    // Handle editing a link
    const handleEditLink = (link: LinkItem) => {
        setEditingLink(link);
        setIsAddingNew(false);
    };
    
    // Handle saving edits
    const handleSaveEdit = () => {
        if (editingLink) {
            setLinks(links.map(link => 
                link.id === editingLink.id ? editingLink : link
            ));
            setEditingLink(null);
        }
    };
    
    // Handle canceling edits
    const handleCancelEdit = () => {
        setEditingLink(null);
    };
    
    // Handle delete link
    const handleDeleteLink = (id: string) => {
        setLinks(links.filter(link => link.id !== id));
        if (editingLink?.id === id) {
            setEditingLink(null);
        }
    };
    
    // Handle adding new link
    const handleAddNewLink = () => {
        setIsAddingNew(true);
        setEditingLink(null);
        setNewLink({ label: '', url: '', icon: 'link' });
    };
    
    // Handle saving new link
    const handleSaveNewLink = () => {
        if (newLink.label && newLink.url) {
            try {
                // Formatear la URL si es necesario
                let formattedUrl = newLink.url;
                if (!formattedUrl.startsWith('http')) {
                    formattedUrl = `https://${formattedUrl}`;
                }
                
                // Crear nuevo enlace con ID único
                const newLinkItem: LinkItem = {
                    id: `link_${Date.now()}`,
                    label: newLink.label.trim(),
                    url: formattedUrl,
                    icon: newLink.icon || 'link'
                };
                
                // Agregar a la lista y reiniciar el formulario
                setLinks([...links, newLinkItem]);
                setIsAddingNew(false);
                setNewLink({ label: '', url: '', icon: 'link' });
            } catch (error) {
                console.error('Error al crear enlace:', error);
            }
        }
    };
    
    return (
        <div className="bg-[#222222] rounded-lg shadow-lg p-4 mb-6">
            <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-4">Manage Links</h3>
                <p className="text-gray-400 text-sm">Add and manage links for your profile.</p>
            </div>
            
            {/* Links List */}
            <div className="space-y-3 mb-4">
                {links.length === 0 && !isAddingNew && (
                    <div className="text-gray-400 text-sm text-center py-3">
                        No links added yet. Add your first link below.
                    </div>
                )}
                
                {links.map(link => (
                    <div 
                        key={link.id}
                        className="bg-[#2a2a2a] p-3 rounded-lg"
                    >
                        {editingLink && editingLink.id === link.id ? (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Link Label</label>
                                    <input
                                        type="text"
                                        value={editingLink.label}
                                        onChange={(e) => setEditingLink({...editingLink, label: e.target.value})}
                                        className="w-full bg-[#363636] text-white p-2 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">URL</label>
                                    <input
                                        type="url"
                                        value={editingLink.url}
                                        onChange={(e) => setEditingLink({...editingLink, url: e.target.value})}
                                        className="w-full bg-[#363636] text-white p-2 rounded-lg text-sm"
                                    />
                                </div>
                                <div className="flex justify-end space-x-2 mt-2">
                                    <button
                                        onClick={handleCancelEdit}
                                        className="px-3 py-1 bg-[#444444] text-white rounded-lg flex items-center text-xs"
                                    >
                                        <X size={12} className="mr-1" /> Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        className="px-3 py-1 bg-purple-600 text-white rounded-lg flex items-center text-xs"
                                    >
                                        <Save size={12} className="mr-1" /> Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="text-white text-sm font-medium">{link.label}</h4>
                                    <p className="text-gray-400 text-xs">{link.url}</p>
                                </div>
                                <div className="flex space-x-1">
                                    <button 
                                        onClick={() => handleEditLink(link)}
                                        className="p-1 rounded-lg hover:bg-[#363636] text-gray-300"
                                    >
                                        <Edit size={14} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteLink(link.id)}
                                        className="p-1 rounded-lg hover:bg-[#363636] text-gray-300"
                                    >
                                        <Trash size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                
                {/* Add New Link Form */}
                {isAddingNew && (
                    <div className="bg-[#2a2a2a] p-3 rounded-lg">
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Link Label</label>
                                <input
                                    type="text"
                                    value={newLink.label}
                                    onChange={(e) => setNewLink({...newLink, label: e.target.value})}
                                    placeholder="e.g. My Website"
                                    className="w-full bg-[#363636] text-white p-2 rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">URL</label>
                                <input
                                    type="url"
                                    value={newLink.url}
                                    onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                                    placeholder="https://example.com"
                                    className="w-full bg-[#363636] text-white p-2 rounded-lg text-sm"
                                />
                            </div>
                            <div className="flex justify-end space-x-2 mt-2">
                                <button
                                    onClick={() => setIsAddingNew(false)}
                                    className="px-3 py-1 bg-[#444444] text-white rounded-lg flex items-center text-xs"
                                >
                                    <X size={12} className="mr-1" /> Cancel
                                </button>
                                <button
                                    onClick={handleSaveNewLink}
                                    disabled={!newLink.label || !newLink.url}
                                    className={`px-3 py-1 ${!newLink.label || !newLink.url ? 'bg-gray-600' : 'bg-purple-600'} text-white rounded-lg flex items-center text-xs`}
                                >
                                    <Save size={12} className="mr-1" /> Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Add Link Button */}
            {!isAddingNew && (
                <button 
                    onClick={handleAddNewLink}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 px-3 w-full transition duration-200 flex items-center justify-center text-sm"
                >
                    <Plus size={16} className="mr-1" /> Add New Link
                </button>
            )}
        </div>
    );
};

export default LinksEditor;
