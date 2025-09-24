export default function Input({
  value,
  onChange,
  type = "text",
  placeholder,
  name,
  disabled,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      disabled={disabled}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full h-10 bg-[#FAFFF6] text-xs text-black px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 "
    />
  );
}
