import { QRCodeSVG } from "qrcode.react";
import type { VCardData } from "../../types/V-Card";
import { Globe, Mail, Phone, X, Contact2 } from "lucide-react";
import VCardComponent from "./VCardComponent";

export default function VCardModal({
  cardData,
  themeConfig,
  onClose,
}: {
  cardData: VCardData;
  themeConfig: any;
  onClose: () => void;
}) {
  return (
    <div className="fixed py-2 inset-0 bg-black/50 flex items-start justify-center p-0 z-50 h-screen min-h-screen">
      <div className="bg-white shadow-2xl rounded-2xl max-w-md w-full max-h-[90vh] mx-2 flex flex-col min-h-0 justify-between">
        <div className="flex items-center justify-between p-3 border-b">
          <h2
            className="text-xl font-bold text-black"
            style={{ fontFamily: themeConfig.fonts.primary }}
          >
            Mi Tarjeta Digital
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={25} className="text-gray-600" />
          </button>
        </div>
        <VCardComponent cardData={cardData} themeConfig={themeConfig} />
      </div>
    </div>
  );
}
