import React from 'react';
import { X, Save } from 'lucide-react';
import { useBiositeContext } from '../../../../context/BiositeContext';
import StyleEditorContent from './StyleEditorContent';

const StyleEditor: React.FC = () => {
  const { setShowStyleEditor, saveBiosite, loading } = useBiositeContext();
  
  const handleSave = () => {
    saveBiosite();
  };
  
  return (
    <div className="bg-[#222222] rounded-lg shadow-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">Style Settings</h3>
        <div className="flex space-x-2">
          <button 
            onClick={handleSave}
            disabled={loading}
            className={`px-3 py-1 rounded-lg flex items-center text-xs ${
              loading ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'
            } text-white transition-colors`}
          >
            <Save size={14} className="mr-1" />
            <span>{loading ? 'Saving...' : 'Save'}</span>
          </button>
          <button 
            onClick={() => setShowStyleEditor(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      
      <StyleEditorContent />
    </div>
  );
};

export default StyleEditor;
