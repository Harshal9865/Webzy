import { getWebzyPublicConfig } from '@webzy/core';
import { CustomRequestClient } from '../../components/storefront/CustomRequestClient';

export const revalidate = 300;

export default function RequestPage() {
  const config = getWebzyPublicConfig();
  const digits = config.business.supportWhatsapp.replace(/\D/g, '') || '919800000000';
  const waHref = `https://wa.me/${digits}?text=${encodeURIComponent(
    'Hi Webzy! I would like to request a custom occasion website.',
  )}`;

  return (
    <CustomRequestClient
      waHref={waHref}
      supportEmail={config.business.supportEmail}
    />
  );
}
