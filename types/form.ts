export type FieldType = 'text' | 'email' | 'number' | 'password' | 'tel' | 'select' | "date" | "time";
export type FieldValue = string | number;
export type FieldValueType = 'string' | 'number';

export type FieldConfig = {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  minLength?: number;
  min?: number;
  options?: { label: string; value: FieldValue }[];
  optionsType?: FieldValueType;
};

export function is_numeric(field: FieldConfig) {
  return (field.type === "number" || field.optionsType === "number")
}