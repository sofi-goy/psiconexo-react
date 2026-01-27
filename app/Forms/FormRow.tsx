import { FieldConfig } from '@/types/form';

import { ChangeEvent } from 'react';

type Props = {
  field: FieldConfig;
  onChange: (field: FieldConfig, value: string) => void;
};

export function FormRow({ field, onChange }: Props) {
  function renderInput() {
    switch (field.type) {
      case 'number':
      case 'text':
      case 'email':
      case 'password':
      case 'tel':
        return (<input id={field.id} type={field.type} name={field.name} onChange={handleChange} />)
      case 'select':
        if (field.options) {
          const select_options = field.options.map(
            (option) => <option key={option.label} value={option.value}>{option.label}</option>
          );

          return (
            <select id={field.id} name={field.name} onChange={handleChange}>
              {select_options}
            </select>
          )
        }
        return;
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    onChange(field, e.target.value);
  }

  return (
    <div className="form-row">
      <label htmlFor={field.id}>{field.label}</label>
      {renderInput()}
    </div>
  )
}