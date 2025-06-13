import React, { useState } from 'react';
import { Link as LinkIcon, Plus, Trash, Edit, Save, X, ArrowLeft } from 'lucide-react';
import { useBiositeContext } from '../../../../context/BiositeContext';
import { useNavigate } from 'react-router-dom';

const LinksPage = () => {
    const { links, setLinks, saveBiosite, loading } = useBiositeContext();
    const navigate = useNavigate();
    
    const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
    const [newLink, setNewLink] = useState({ label: '', url: '' });
    const [showAddForm, setShowAddForm] = useState(false);
    
    // Form values for editing
    const [editFormValues, setEditFormValues] = useState({ label: '', url: '' });
    
    // Handle back navigation
    const handleBack = () => {
        navigate('/sections');
    };
    
    // Handle edit link
    const handleEditClick = (id: string, label: string, url: string) => {
        setEditingLinkId(id);
        setEditFormValues({ label, url });
    };
    
    // Handle save edited link
    const handleSaveEdit = (id: string) => {
        if (editFormValues.label && editFormValues.url) {
            setLinks(links.map(link => 
                link.id === id 
                    ? { ...link, label: editFormValues.label, url: editFormValues.url } 
                    : link
            ));
            setEditingLinkId(null);
        }
    };
    
    // Handle delete link
    const handleDeleteLink = (id: string) => {
        setLinks(links.filter(link => link.id !== id));
    };
    
    // Handle add new link
    const handleAddLink = () => {
        if (newLink.label && newLink.url) {
            const url = newLink.url.startsWith('http') ? newLink.url : `https://${newLink.url}`;
            
            setLinks([...links, { 
                id: Date.now().toString(), 
                label: newLink.label, 
                url: url,
                icon: 'link' 
            }]);
            
            setNewLink({ label: '', url: '' });
            setShowAddForm(false);
        }
    };
    
    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <button 
                        onClick={handleBack} 
                        className="mr-4 p-1 rounded hover:bg-gray-700 transition-colors"
                    >
                        <ArrowLeft size={20} className="text-white" />
                    </button>
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                        <LinkIcon size={20} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Links</h2>
                </div>
                <button 
                    onClick={saveBiosite}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white`}
                >
                    {loading ? 'Guardando...' : 'Guardar cambios'}
                </button>
            </div>
            
            <div className="bg-[#2a2a2a] rounded-lg p-6">
                <div className="mb-4">
                    <h3 className="text-lg font-medium text-white mb-4">Your Links</h3>
                    <p className="text-gray-400">Add links to your profile to share websites, social media, or other online content.</p>
                </div>
                
                <div className="mt-6">
                    {links.length === 0 && !showAddForm ? (
                        <div className="text-center text-gray-400 py-6">
                            No links added yet. Add your first link below.
                        </div>
                    ) : (
                        <div className="space-y-3 mb-4">
                            {links.map(link => (
                                <div key={link.id} className="bg-[#323232] p-4 rounded-lg">
                                    {editingLinkId === link.id ? (
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-gray-400 text-sm mb-1">Label</label>
                                                <input 
                                                    type="text"
                                                    value={editFormValues.label}
                                                    onChange={e => setEditFormValues({...editFormValues, label: e.target.value})}
                                                    className="w-full bg-[#444444] text-white rounded px-3 py-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-400 text-sm mb-1">URL</label>
                                                <input 
                                                    type="text"
                                                    value={editFormValues.url}
                                                    onChange={e => setEditFormValues({...editFormValues, url: e.target.value})}
                                                    className="w-full bg-[#444444] text-white rounded px-3 py-2"
                                                />
                                            </div>
                                            <div className="flex justify-end space-x-2 mt-2">
                                                <button 
                                                    onClick={() => setEditingLinkId(null)}
                                                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded flex items-center"
                                                >
                                                    <X size={16} className="mr-1" /> Cancel
                                                </button>
                                                <button 
                                                    onClick={() => handleSaveEdit(link.id)}
                                                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded flex items-center"
                                                >
                                                    <Save size={16} className="mr-1" /> Save
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="text-white">{link.label}</h4>
                                                <p className="text-gray-400 text-sm">{link.url}</p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button 
                                                    onClick={() => handleEditClick(link.id, link.label, link.url)}
                                                    className="text-gray-400 hover:text-white p-2"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteLink(link.id)}
                                                    className="text-gray-400 hover:text-white p-2"
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {showAddForm ? (
                        <div className="bg-[#323232] p-4 rounded-lg mb-4">
                            <h4 className="text-white mb-3">Add New Link</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Label</label>
                                    <input 
                                        type="text"
                                        value={newLink.label}
                                        onChange={e => setNewLink({...newLink, label: e.target.value})}
                                        placeholder="e.g. My Website"
                                        className="w-full bg-[#444444] text-white rounded px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">URL</label>
                                    <input 
                                        type="text"
                                        value={newLink.url}
                                        onChange={e => setNewLink({...newLink, url: e.target.value})}
                                        placeholder="https://example.com"
                                        className="w-full bg-[#444444] text-white rounded px-3 py-2"
                                    />
                                </div>
                                <div className="flex justify-end space-x-2 mt-2">
                                    <button 
                                        onClick={() => setShowAddForm(false)}
                                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded flex items-center"
                                    >
                                        <X size={16} className="mr-1" /> Cancel
                                    </button>
                                    <button 
                                        onClick={handleAddLink}
                                        disabled={!newLink.label || !newLink.url}
                                        className={`${!newLink.label || !newLink.url ? 'bg-purple-500 opacity-50 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'} text-white px-3 py-1 rounded flex items-center`}
                                    >
                                        <Save size={16} className="mr-1" /> Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setShowAddForm(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 px-4 w-full transition duration-200 flex items-center justify-center"
                        >
                            <Plus size={18} className="mr-2" /> Add New Link
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LinksPage;
