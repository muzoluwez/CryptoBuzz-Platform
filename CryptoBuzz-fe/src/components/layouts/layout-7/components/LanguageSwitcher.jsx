import React, { useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { useGetLanguagesQuery } from '@/store/client/clientLanguageApiSlice';
import {
  selectLanguages,
  selectSelectedLanguage,
  setLanguages,
  setSelectedLanguage,
} from '@/store/languageSlice';
import { Button } from '@/components/ui/button';

export default function LanguageSwitcher() {
  const dispatch = useDispatch();
  const languages = useSelector(selectLanguages) || [];
  const selectedLanguage = useSelector(selectSelectedLanguage) || { name: 'English' };

  const { data: languagesData, isSuccess } = useGetLanguagesQuery();

  useEffect(() => {
    if (isSuccess && languagesData?.data) {
      dispatch(setLanguages(languagesData.data));
    }
  }, [isSuccess, languagesData, dispatch]);

  const handleSelect = (value) => {
    // value may be id or name depending on how languages were populated
    dispatch(setSelectedLanguage(value));
  };

  const displayLanguages = languages?.length > 0 ? languages : [{ _id: 'default', name: 'English' }];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          size="sm"
          variant="ghost"
          aria-label="Select language"
          className="pr-2 py-1 rounded-lg flex cursor-pointer items-center gap-2 text-white !hover:text-amber-400"
        >
          <Globe className="w-4 h-4 text-white !hover:text-amber-400" />
          <span className="text-sm inline text-white !hover:text-amber-400">{selectedLanguage?.name || 'English'}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-44" sideOffset={8}>
        <DropdownMenuRadioGroup defaultValue={selectedLanguage?._id || selectedLanguage?.name} onValueChange={handleSelect}>
          {displayLanguages.map((lang) => (
            <DropdownMenuRadioItem key={lang?._id || lang?.name} value={lang?._id || lang?.name}>
              <div className="flex items-center justify-between w-full">
                <span className="text-sm">{lang?.name}</span>
                { (selectedLanguage?._id === lang?._id || selectedLanguage?.name === lang?.name) && (
                  <Check className="w-4 h-4 text-primary" />
                ) }
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
