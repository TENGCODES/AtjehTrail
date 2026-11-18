"use client";

export function AutoSelect({
  name,
  defaultValue,
  options,
  className = "",
  form,
}: {
  name: string;
  defaultValue: string;
  options: { value: string; label: string }[];
  className?: string;
  form?: string;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      form={form}
      onChange={(event) => event.currentTarget.form?.requestSubmit()}
      className={className}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
