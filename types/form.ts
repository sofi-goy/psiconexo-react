export type FieldType = 'text' | 'email' | 'number' | 'password' | 'tel';

export type FieldConfig = {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  minLength?: number;
  min?: number;
};
