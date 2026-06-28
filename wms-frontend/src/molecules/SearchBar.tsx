import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../atoms/Input';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<Props> = ({ value, onChange, placeholder = 'Search…' }) => (
  <Input
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    leftIcon={<Search size={15} />}
    style={{ minWidth: 220 }}
  />
);
