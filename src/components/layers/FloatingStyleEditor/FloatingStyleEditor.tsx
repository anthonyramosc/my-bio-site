import React from 'react';
import { X, Save } from 'lucide-react';
import { useBiositeContext } from '../../../context/BiositeContext';
import StyleEditorContent from '../MySite/Style/StyleEditorContent';

const FloatingStyleEditor: React.FC = () => {
  const { showStyleEditor, setShowStyleEditor, saveBiosite, loading } = useBiositeContext();
  
  if (!showStyleEditor) {
    return null;
  }
  
  const handleSave = () => {
    saveBiosite();
  };
  
  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-[#222222] shadow-xl z-50 overflow-y-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4 border-b border-[#333333] pb-3">
          <h3 className="text-lg font-medium text-white">Style Editor</h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleSave}
              disabled={loading}
              className={`px-4 py-1 rounded-lg flex items-center space-x-1 ${
                loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              } text-white transition-colors`}
            >
              <Save size={16} />
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
    </div>
  );
};

export default FloatingStyleEditor;
