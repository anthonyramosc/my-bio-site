export default function FomrField({
  title,
  children,
}: {
  title: string;
  children: any;
}) {
  return (
    <div>
      <p className="text-xs mb-1 text-gray-600 uppercase">{title}</p>
      {children}
    </div>
  );
}
