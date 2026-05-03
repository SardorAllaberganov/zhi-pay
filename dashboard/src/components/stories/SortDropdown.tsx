import { ChevronDown, ArrowUpDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import { STORY_SORT_LABEL_KEY, type StorySortKey } from './types';

const ORDER: StorySortKey[] = ['display_order', 'created', 'expiring'];

export function SortDropdown({
  value,
  onChange,
}: {
  value: StorySortKey;
  onChange: (next: StorySortKey) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-9 gap-1.5">
          <ArrowUpDown className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
          <span className="text-sm">{t(STORY_SORT_LABEL_KEY[value])}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as StorySortKey)}>
          {ORDER.map((key) => (
            <DropdownMenuRadioItem key={key} value={key}>
              {t(STORY_SORT_LABEL_KEY[key])}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
