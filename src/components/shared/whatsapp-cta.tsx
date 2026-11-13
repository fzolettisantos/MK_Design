import { MessageCircle } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui";
import { buildWhatsAppUrl } from "@/config/whatsapp";

interface Props {
  children?: React.ReactNode;
  variant?: ButtonProps["variant"];
  className?: string;
  message?: string;
}

/**
 * CTA de WhatsApp. Sem número real configurado (NEXT_PUBLIC_WHATSAPP_NUMBER), o botão fica
 * desabilitado e explica o motivo — nunca usa número fictício.
 */
export function WhatsAppCTA({
  children = "Falar pelo WhatsApp",
  variant = "outline",
  className,
  message = "Olá! Gostaria de falar com a MK Design.",
}: Props) {
  const url = buildWhatsAppUrl(message);
  if (!url) {
    return (
      <Button variant={variant} className={className} disabled title="Número de WhatsApp ainda não configurado">
        <MessageCircle aria-hidden="true" />
        {children}
      </Button>
    );
  }
  return (
    <Button asChild variant={variant} className={className}>
      <a href={url} target="_blank" rel="noopener noreferrer">
        <MessageCircle aria-hidden="true" />
        {children}
        <span className="sr-only"> (abre em nova aba)</span>
      </a>
    </Button>
  );
}
