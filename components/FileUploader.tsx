
import React, { useState } from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.pdf') || file.name.endsWith('.pptx')) {
        onFileSelect(file);
      } else {
        alert("Veuillez déposer un fichier PDF ou PPTX.");
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative group cursor-pointer transition-all duration-500
        border-2 border-dashed rounded-[2.5rem] p-16 text-center
        ${isDragging ? 'border-gold bg-gold/5 scale-[1.01]' : 'border-anthracite-lighter bg-anthracite hover:border-gold/40 hover:bg-anthracite-lighter'}
      `}
    >
      <input 
        type="file" 
        id="fileInput" 
        className="hidden" 
        accept=".pdf,.pptx"
        onChange={handleFileInput}
      />
      <label htmlFor="fileInput" className="cursor-pointer block">
        <div className="mx-auto w-20 h-20 bg-gold/5 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gold/10 transition-all duration-500 border border-gold/10">
          <svg className="w-10 h-10 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Déposez votre présentation</h3>
        <p className="text-slate-500 text-sm font-medium uppercase tracking-widest mb-8">PDF ou PPTX supportés</p>
        
        <div className="inline-flex items-center px-8 py-4 bg-gold text-anthracite rounded-2xl text-[13px] font-black uppercase tracking-widest group-hover:bg-gold-light transition-colors shadow-2xl shadow-gold/5">
          Parcourir mes fichiers
        </div>
      </label>
    </div>
  );
};
