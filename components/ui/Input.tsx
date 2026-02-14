type Props = {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Input({ placeholder, value, onChange }: Props) {
  return (
    <input
      className="border p-2 rounded w-full"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}
