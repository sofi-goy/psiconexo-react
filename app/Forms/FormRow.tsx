import { FieldConfig } from '@/types/form';

import { ChangeEvent } from 'react';

type Props = {
  field: FieldConfig;
  onChange: (field: FieldConfig, value: string) => void;
};

export function FormRow({ field, onChange } : Props) {
     function handleChange(e: ChangeEvent<HTMLInputElement>) {
        console.log("Cambiando " + field.name)
        onChange(field, e.target.value);
      }

    return (
      <div className="form-row">
        <label htmlFor={field.id}>{field.label}</label>
        <input id={field.id} type={field.type} name={field.name} onChange={handleChange}></input>
        <hr></hr>
      </div>
    )
}