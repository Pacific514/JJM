
import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Save, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';

const LogoManager: React.FC = () => {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewLogo, setPreviewLogo] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Logo par défaut et logo actuel
  const defaultLogo = "https://static.lumi.new/e5/e5fec81e2a72d5284b07d2c7ca256c9d.webp";
  const currentLogo = localStorage.getItem('customLogo') || defaultLogo;

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image (PNG, JPG, SVG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      toast.error('Le fichier est trop volumineux (maximum 5MB)');
      return;
    }

    setIsUploading(true);

    try {
      // Redimensionner l'image pour optimiser l'affichage
      const resizedImage = await resizeImage(file, 400, 150);
      
      // Convertir en base64 pour stockage local
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewLogo(result);
        setIsUploading(false);
        toast.success('Image chargée avec succès');
      };
      reader.readAsDataURL(resizedImage);
    } catch (error) {
      console.error('Erreur traitement image:', error);
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

        // Dessiner l'image redimensionnée avec une qualité optimisée
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

  const saveLogo = () => {
    if (previewLogo) {
      localStorage.setItem('customLogo', previewLogo);
      toast.success('Logo mis à jour avec succès !');
      setPreviewLogo('');
      // Forcer le rechargement du header
      window.location.reload();
    }
  };

  const resetToDefault = () => {
    localStorage.removeItem('customLogo');
    setPreviewLogo('');
    toast.success('Logo par défaut restauré');
    // Forcer le rechargement du header
    window.location.reload();
  };

  const cancelPreview = () => {
    setPreviewLogo('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Gestion du Logo
      </h2>
      
      {/* Logo actuel */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Logo actuel
        </h3>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600">
          <img
            src={currentLogo}
            alt="Logo actuel"
            className="max-h-20 w-auto object-contain"
          />
        </div>
      </div>

      {/* Prévisualisation du nouveau logo */}
      {previewLogo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Prévisualisation
          </h3>
          <div className="bg-gray-900 p-4 rounded-lg border-2 border-red-500">
            <img
              src={previewLogo}
              alt="Nouveau logo"
              className="max-h-20 w-auto object-contain"
            />
          </div>
          
          {/* Actions pour la prévisualisation */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={saveLogo}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Sauvegarder</span>
            </button>
            <button
              onClick={cancelPreview}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Annuler</span>
            </button>
          </div>
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
          transition-all duration-200 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10
          ${isDragging ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-gray-600'}
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300">Traitement de l'image...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              {isDragging ? (
                <Upload className="h-12 w-12 text-red-500" />
              ) : (
                <ImageIcon className="h-12 w-12 text-gray-400" />
              )}
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {isDragging ? 'Déposez votre nouveau logo ici' : 'Cliquez ou glissez votre nouveau logo'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                PNG, JPG, SVG jusqu'à 5MB
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Le logo sera automatiquement optimisé pour tous les écrans
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bouton restaurer par défaut */}
      {currentLogo !== defaultLogo && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={resetToDefault}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Restaurer le logo par défaut</span>
          </button>
        </div>
      )}

      {/* Informations techniques */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          Adaptation automatique
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <span>Desktop: jusqu'à 320px</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <span>Tablette: jusqu'à 240px</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <span>Mobile: jusqu'à 192px</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoManager;
