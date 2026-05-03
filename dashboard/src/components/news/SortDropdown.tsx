import { ArrowUpDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import {
  NEWS_SORT_LABEL_KEY,
  type NewsSort,
  type NewsSortKey,
} from './types';

interface Props {
  value: NewsSort;
  onChange: (next: NewsSort) => void;
}

const ORDER: NewsSortKey[] = ['default', 'published', 'created'];

export function SortDropdown({ value, onChange }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
          <span className="text-sm">{t(NEWS_SORT_LABEL_KEY[value.key])}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {ORDER.map((k) => {
          const isActive = value.key === k;
          return (
            <DropdownMenuItem
              key={k}
              onClick={() => onChange({ key: k })}
              className="flex items-center justify-between text-sm"
            >
              <span>{t(NEWS_SORT_LABEL_KEY[k])}</span>
              {isActive && <Check className="h-4 w-4 text-brand-600" aria-hidden="true" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
