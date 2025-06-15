import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';

interface CustomizationSettings {
  theme_choice: string;
  color_palette: {
    backgroundColor: string;
    textColor: string;
  };
  layout: string;
}

const UV_Customization: React.FC = () => {
  const queryClient = useQueryClient();
  
  // Access global state with useAppStore
  const { auth_token, theme_settings, set_theme_settings } = useAppStore((state) => ({
    auth_token: state.auth_token,
    theme_settings: state.theme_settings,
    set_theme_settings: state.set_theme_settings,
  }));

  const [themePicker, setThemePicker] = useState<string>(theme_settings.current_theme || 'default');
  const [customizationPanel, setCustomizationPanel] = useState<{ colorPalette: { backgroundColor: string; textColor: string; }; layout: string; }>({
    colorPalette: theme_settings.color_palette,
    layout: 'standard',
  });
  const [changesSaved, setChangesSaved] = useState<boolean>(false);

  // Mutation for saving the customization
  const mutation = useMutation({
    mutationFn: async (newSettings: CustomizationSettings) => {
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000'}/api/designer-profile`, 
        { customization: newSettings },
        {
          headers: { Authorization: `Bearer ${auth_token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['theme_settings']);
      setChangesSaved(true);
      set_theme_settings({
        current_theme: themePicker,
        color_palette: customizationPanel.colorPalette,
        logo_url: theme_settings.logo_url,
      });
    },
    onError: () => {
      setChangesSaved(false);
      alert('Failed to save customization. Please try again.');
    }
  });

  useEffect(() => {
    if (
      themePicker !== theme_settings.current_theme || 
      customizationPanel.colorPalette.backgroundColor !== theme_settings.color_palette.backgroundColor
    ) {
      setChangesSaved(false);
    }
  }, [themePicker, customizationPanel, theme_settings.color_palette.backgroundColor, theme_settings.current_theme]);

  const handleSaveCustomization = () => {
    mutation.mutate({
      theme_choice: themePicker,
      color_palette: customizationPanel.colorPalette,
      layout: customizationPanel.layout,
    });
  };

  const handleThemeSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setThemePicker(event.target.value);
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCustomizationPanel((prev) => ({
      ...prev,
      colorPalette: {
        ...prev.colorPalette,
        [name]: value,
      },
    }));
  };

  return (
    <>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Customization Page</h1>
        
        <div className="mb-4">
          <label className="block text-gray-700">Select Theme:</label>
          <select value={themePicker} onChange={handleThemeSelect} className="mt-1 block w-full">
            <option value="default">Default</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Background Color:</label>
          <input
            type="color"
            name="backgroundColor"
            value={customizationPanel.colorPalette.backgroundColor}
            onChange={handleColorChange}
            className="mt-1 block w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Text Color:</label>
          <input
            type="color"
            name="textColor"
            value={customizationPanel.colorPalette.textColor}
            onChange={handleColorChange}
            className="mt-1 block w-full"
          />
        </div>

        <button
          onClick={handleSaveCustomization}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={changesSaved}
        >
          {changesSaved ? 'Changes Saved' : 'Save Customization'}
        </button>
      </div>
    </>
  );
};

export default UV_Customization;