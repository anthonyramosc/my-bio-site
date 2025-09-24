export default function Button({
  onClick,
  children,
  variant = "primary", // Valor por defecto
  disabled = false,
  submit = false,
}: {
  onClick?: () => void;
  children?: any;
  variant?: ButtonVariant;
  disabled?: boolean;
  submit?: boolean;
}) {
  const baseClasses =
    " py-1 rounded-sm font-medium transition-all duration-200 px-5 mx-auto flex items-center gap-2";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-[#98C022] hover:bg-[#86A81E] text-white focus:ring-2 focus:ring-[#98C022] focus:ring-offset-2",
    secondary:
      "bg-[#98C022]/50 hover:bg-[#98C022]/70 text-white focus:ring-2 focus:ring-[#98C022] focus:ring-offset-2",
    danger:
      "bg-red-500 hover:bg-red-600 text-white focus:ring-2 focus:ring-red-300 focus:ring-offset-2",
  };

  // Estilos para estado deshabilitado
  const disabledClasses = "opacity-50 cursor-not-allowed pointer-events-none";

  // Determinar las clases finales
  const buttonClasses = disabled
    ? `${baseClasses} ${variants[variant]} ${disabledClasses}`
    : `${baseClasses} ${variants[variant]} cursor-pointer `;

  return (
    <button
      type={submit ? "submit" : "button"}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={buttonClasses}
    >
      {children}
    </button>
  );
}

type ButtonVariant = "primary" | "secondary" | "danger";
