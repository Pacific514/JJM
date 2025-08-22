
import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface LogoUploaderProps {
  currentLogo?: string;
  onLogoChange: (logoUrl: string) => void;
  className?: string;
}

const LogoUploader: React.FC<LogoUploaderProps> = ({ 
  currentLogo, 
  onLogoChange, 
  className = "" 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      toast.error('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    setIsUploading(true);

    try {
      // Redimensionner l'image
      const resizedImage = await resizeImage(file, 300, 100);
      
      // Convertir en base64 pour stockage local (en production, utiliser un service cloud)
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onLogoChange(result);
        toast.success('Logo mis à jour avec succès');
        setIsUploading(false);
      };
      reader.readAsDataURL(resizedImage);
    } catch (error) {
      console.error('Erreur upload logo:', error);
      toast.error('Erreur lors du traitement de l\'image');
      setIsUploading(false);
    }
  };

  const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Calculer les nouvelles dimensions en gardant le ratio
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          const resizedFile = new File([blob!], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(resizedFile);
        }, file.type, 0.9);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeLogo = () => {
    onLogoChange('');
    toast.success('Logo supprimé');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-neutral-900">Logo de l'entreprise</h3>
      
      {/* Prévisualisation du logo actuel */}
      {currentLogo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative inline-block"
        >
          <div className="bg-white p-4 rounded-lg border-2 border-neutral-200 shadow-sm">
            <img
              src={currentLogo}
              alt="Logo actuel"
              className="max-h-16 w-auto object-contain"
            />
          </div>
          <button
            onClick={removeLogo}
            className="absolute -top-2 -right-2 bg-secondary-500 text-white rounded-full p-1 hover:bg-secondary-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* Zone d'upload */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200 hover:border-primary-500 hover:bg-primary-50
          ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-neutral-300'}
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-neutral-600">Traitement de l'image...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              {isDragging ? (
                <Upload className="h-12 w-12 text-primary-500" />
              ) : (
                <ImageIcon className="h-12 w-12 text-neutral-400" />
              )}
            </div>
            
            <div>
              <p className="text-lg font-medium text-neutral-900">
                {isDragging ? 'Déposez votre logo ici' : 'Cliquez ou glissez votre logo'}
              </p>
              <p className="text-sm text-neutral-600 mt-1">
                PNG, JPG, SVG jusqu'à 5MB
              </p>
              <p className="text-xs text-neutral-500 mt-2">
                Le logo sera automatiquement redimensionné pour s'adapter à tous les écrans
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Informations sur le responsive */}
      <div className="bg-neutral-50 p-4 rounded-lg">
        <h4 className="font-medium text-neutral-900 mb-2">Adaptation automatique</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-neutral-600">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-6 bg-neutral-300 rounded"></div>
            <span>Desktop: 200px max</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-4 bg-neutral-300 rounded"></div>
            <span>Tablette: 150px max</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-3 bg-neutral-300 rounded"></div>
            <span>Mobile: 120px max</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoUploader;
