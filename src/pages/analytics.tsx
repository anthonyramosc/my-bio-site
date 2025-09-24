import React, { useEffect, useState, useCallback } from "react";
import { getBiositeAnalytics } from "../service/apiService";
import Cookies from "js-cookie";
import LivePreviewContent from "../components/Preview/LivePreviewContent.tsx";
import PhonePreview from "../components/Preview/phonePreview.tsx";
import {
  AnalyticsWrapper,
  useOptionalAnalytics,
} from "../components/global/Analytics/AnalyticsWrapper";
import analyticsEventManager from "../service/AnalyticsEventManager";
import jsPDF from "jspdf";
import NewBiositePage from "../context/NewBiositePage/NewBiositePage.tsx";
import {usePreview} from "../context/PreviewContext.tsx";

interface DailyActivity {
  day: string;
  views: number;
  clicks: number;
}

interface ClickDetail {
  label: string;
  count: number;
}

interface AnalyticsData {
  dailyActivity: DailyActivity[];
  clickDetails: ClickDetail[];
  views: number;
  clicks: number;
}

type TimeRange = "last7" | "last30" | "lastYear";

const AnalyticsContent = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [biositeId, setBiositeId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isDownloading, setIsDownloading] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("last7");
  const { biosite } = usePreview();

  const analyticsContext = useOptionalAnalytics();

  const triggerRefresh = useCallback(() => {
    const now = new Date();
    setLastRefresh(now);

    setTimeout(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, 1000);
  }, []);

  const timeRangeOptions = [
    { value: "last7" as TimeRange, label: "Últimos 7 días" },
    { value: "last30" as TimeRange, label: "Últimos 30 días" },
    { value: "lastYear" as TimeRange, label: "Último año" },
  ];

  const handleTimeRangeChange = useCallback((newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange);
    setLoading(true);
    setTimeout(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, 100);
  }, []);
  const generatePDFBlob = useCallback(async (): Promise<Blob> => {
    const timeRangeLabel =
      timeRangeOptions.find((option) => option.value === timeRange)?.label ||
      "Período seleccionado";

    const doc = new jsPDF();

    const primaryColor: [number, number, number] = [152, 192, 34];
    const darkColor: [number, number, number] = [51, 51, 51];
    const grayColor: [number, number, number] = [102, 102, 102];
    const lightGrayColor: [number, number, number] = [248, 249, 250];

    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.text("Reporte de Métricas", 20, 30);

    doc.setFontSize(12);
    doc.setTextColor(...grayColor);
    doc.text("Biosite Analytics Dashboard", 20, 40);

    const currentDate = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    doc.text(`Generado el ${currentDate}`, 20, 50);

    doc.setLineWidth(0.5);
    doc.setDrawColor(...primaryColor);
    doc.line(20, 55, 190, 55);

    // Período
    doc.setFontSize(14);
    doc.setTextColor(...darkColor);
    doc.text(`Período: ${timeRangeLabel}`, 20, 70);

    // Métricas principales
    let yPosition = 85;
    doc.setFontSize(16);
    doc.setTextColor(...darkColor);
    doc.text("Resumen General", 20, yPosition);

    yPosition += 15;

    // Crear rectángulos para las métricas
    const metricBoxWidth = 50;
    const metricBoxHeight = 25;
    const spacing = 60;

    // Total Vistas
    doc.setFillColor(...lightGrayColor);
    doc.rect(20, yPosition, metricBoxWidth, metricBoxHeight, "F");
    doc.setTextColor(...darkColor);
    doc.setFontSize(20);
    doc.text(analyticsData!.views.toString(), 25, yPosition + 15);
    doc.setFontSize(10);
    doc.text("TOTAL VISTAS", 25, yPosition + 22);

    // Total Clicks
    doc.setFillColor(...lightGrayColor);
    doc.rect(20 + spacing, yPosition, metricBoxWidth, metricBoxHeight, "F");
    doc.setTextColor(...darkColor);
    doc.setFontSize(20);
    doc.text(analyticsData!.clicks.toString(), 25 + spacing, yPosition + 15);
    doc.setFontSize(10);
    doc.text("TOTAL CLICKS", 25 + spacing, yPosition + 22);

    // CTR
    const ctr =
      analyticsData!.views > 0
        ? Math.round((analyticsData!.clicks / analyticsData!.views) * 100)
        : 0;
    doc.setFillColor(...lightGrayColor);
    doc.rect(20 + spacing * 2, yPosition, metricBoxWidth, metricBoxHeight, "F");
    doc.setTextColor(...darkColor);
    doc.setFontSize(20);
    doc.text(`${ctr}%`, 25 + spacing * 2, yPosition + 15);
    doc.setFontSize(10);
    doc.text("CTR", 25 + spacing * 2, yPosition + 22);

    yPosition += 40;

    // Actividad diaria/mensual
    doc.setFontSize(16);
    doc.setTextColor(...darkColor);
    doc.text(
      `Actividad por ${timeRange === "lastYear" ? "Mes" : "Día"}`,
      20,
      yPosition
    );

    yPosition += 15;

    // Tabla de actividad diaria
    const tableStartY = yPosition;
    const colWidth = 60;

    // Headers de la tabla
    doc.setFillColor(...lightGrayColor);
    doc.rect(20, tableStartY, colWidth, 8, "F");
    doc.rect(20 + colWidth, tableStartY, colWidth, 8, "F");
    doc.rect(20 + colWidth * 2, tableStartY, colWidth, 8, "F");

    doc.setFontSize(10);
    doc.setTextColor(...darkColor);
    doc.text(timeRange === "lastYear" ? "Mes" : "Día", 22, tableStartY + 6);
    doc.text("Vistas", 22 + colWidth, tableStartY + 6);
    doc.text("Clicks", 22 + colWidth * 2, tableStartY + 6);

    let tableY = tableStartY + 8;

    // Datos de la tabla (limitamos a los primeros elementos para evitar overflow)
    const maxRows = Math.min(analyticsData!.dailyActivity.length, 10);
    for (let i = 0; i < maxRows; i++) {
      const activity = analyticsData!.dailyActivity[i];

      doc.setTextColor(...darkColor);
      doc.text(activity.day, 22, tableY + 6);
      doc.text(`${activity.views}`, 22 + colWidth, tableY + 6);
      doc.text(`${activity.clicks}`, 22 + colWidth * 2, tableY + 6);

      tableY += 8;
    }

    // Si hay más datos, agregar una nueva página
    if (
      analyticsData!.dailyActivity.length > 10 ||
      analyticsData!.clickDetails.length > 0
    ) {
      doc.addPage();
      yPosition = 20;

      // Clicks por Link
      if (analyticsData!.clickDetails.length > 0) {
        doc.setFontSize(16);
        doc.setTextColor(...darkColor);
        doc.text("Clicks por Link", 20, yPosition);

        yPosition += 15;

        // Headers de la tabla de clicks
        doc.setFillColor(...lightGrayColor);
        doc.rect(20, yPosition, 120, 8, "F");
        doc.rect(140, yPosition, 40, 8, "F");

        doc.setFontSize(10);
        doc.setTextColor(...darkColor);
        doc.text("Link", 22, yPosition + 6);
        doc.text("Clicks", 142, yPosition + 6);

        yPosition += 8;

        // Datos de clicks
        const maxClickRows = Math.min(analyticsData!.clickDetails.length, 20);
        for (let i = 0; i < maxClickRows; i++) {
          const click = analyticsData!.clickDetails[i];

          doc.setTextColor(...darkColor);
          // Truncar texto largo
          const linkText =
            click.label.length > 30
              ? click.label.substring(0, 27) + "..."
              : click.label;
          doc.text(linkText, 22, yPosition + 6);
          doc.text(click.count.toString(), 142, yPosition + 6);

          yPosition += 8;

          // Si llegamos al final de la página, añadir nueva página
          if (yPosition > 270 && i < maxClickRows - 1) {
            doc.addPage();
            yPosition = 20;
          }
        }
      }
    }

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(...grayColor);
      doc.text(
        "Este reporte fue generado automáticamente por Biosite Analytics",
        20,
        285
      );
      doc.text(`Página ${i} de ${totalPages}`, 170, 285);
    }

    const pdfBlob = doc.output("blob");
    return pdfBlob;
  }, [analyticsData, timeRange, timeRangeOptions]);

  const handleShare = useCallback(async () => {
    if (!analyticsData) return;

    const timeRangeLabel =
      timeRangeOptions.find((option) => option.value === timeRange)?.label ||
      "Período seleccionado";

    try {
      // Texto de resumen para compartir
      const summaryText = `📊 Mis estadísticas (${timeRangeLabel}):\n🔍 ${
        analyticsData.views
      } vistas\n👆 ${analyticsData.clicks} clics\n📈 ${
        analyticsData.views > 0
          ? Math.round((analyticsData.clicks / analyticsData.views) * 100)
          : 0
      }% CTR`;

      // Verificar si el navegador soporta Web Share API con archivos
      if (navigator.share && navigator.canShare) {
        try {
          // Generar PDF
          const pdfBlob = await generatePDFBlob();
          const filename = `biosite-metricas-${timeRangeLabel
            .toLowerCase()
            .replace(/\s+/g, "-")}-${
            new Date().toISOString().split("T")[0]
          }.pdf`;

          // Crear archivo para compartir
          const file = new File([pdfBlob], filename, {
            type: "application/pdf",
          });

          // Verificar si se puede compartir con archivo
          const shareData = {
            title: "Métricas de mi Biosite",
            text: summaryText,
            files: [file],
          };

          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            return;
          }
        } catch (shareError) {
          console.log(
            "No se pudo compartir el archivo, intentando con texto solamente:",
            shareError
          );
        }

        // Fallback: compartir solo texto si no se puede compartir archivo
        try {
          const textOnlyData = {
            title: "Métricas de mi Biosite",
            text: `${summaryText}\n\n📄 Descarga el reporte completo desde: ${window.location.href}`,
          };

          if (navigator.canShare(textOnlyData)) {
            await navigator.share(textOnlyData);
            return;
          }
        } catch (textShareError) {
          console.log("Error compartiendo texto:", textShareError);
        }
      }

      // Fallback final: copiar al portapapeles y descargar PDF
      await navigator.clipboard.writeText(
        `${summaryText}\n\n📄 Reporte completo disponible\n\n${window.location.href}`
      );

      // Generar y descargar PDF automáticamente
      const pdfBlob = await generatePDFBlob();
      const filename = `biosite-metricas-${timeRangeLabel
        .toLowerCase()
        .replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const notification = document.createElement("div");
      notification.innerHTML = `
      <div style="max-width: 300px;">
        <strong>📊 Métricas compartidas</strong><br>
        <small>Texto copiado al portapapeles y PDF descargado</small>
      </div>
    `;
      notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #98C022;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      z-index: 1000;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      max-width: 320px;
    `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 4000);
    } catch (error) {
      console.error("Error sharing:", error);

      // Notificación de error
      const errorNotification = document.createElement("div");
      errorNotification.textContent = "❌ Error al compartir las métricas";
      errorNotification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc3545;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 1000;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
      document.body.appendChild(errorNotification);
      setTimeout(() => errorNotification.remove(), 3000);
    }
  }, [analyticsData, timeRange, timeRangeOptions, generatePDFBlob]);

  const handleDownloadPDF = useCallback(async () => {
    if (!analyticsData || isDownloading) return;

    setIsDownloading(true);

    try {
      const timeRangeLabel =
        timeRangeOptions.find((option) => option.value === timeRange)?.label ||
        "Período seleccionado";

      // Generar PDF usando la función reutilizable
      const pdfBlob = await generatePDFBlob();
      const filename = `biosite-metricas-${timeRangeLabel
        .toLowerCase()
        .replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Mostrar notificación de éxito
      const notification = document.createElement("div");
      notification.innerHTML = `
      <div style="max-width: 300px;">
        <strong>📄 PDF Generado</strong><br>
        <small>El reporte se ha descargado exitosamente</small>
      </div>
    `;
      notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #98C022;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      z-index: 1000;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      max-width: 320px;
    `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } catch (error) {
      console.error("Error generating PDF:", error);

      const errorNotification = document.createElement("div");
      errorNotification.textContent = "❌ Error al generar el PDF";
      errorNotification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc3545;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 1000;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
      document.body.appendChild(errorNotification);
      setTimeout(() => errorNotification.remove(), 3000);
    } finally {
      setIsDownloading(false);
    }
  }, [
    analyticsData,
    isDownloading,
    generatePDFBlob,
    timeRangeOptions,
    timeRange,
  ]);

  useEffect(() => {
    const unsubscribeVisit = analyticsEventManager.onVisitTracked(
      (biositeId) => {
        console.log("📊 Visit tracked for biosite:", biositeId);
        triggerRefresh();
      }
    );

    const unsubscribeClick = analyticsEventManager.onLinkClickTracked(
      (linkId) => {
        console.log("🔗 Link click tracked for link:", linkId);
        triggerRefresh();
      }
    );

    return () => {
      unsubscribeVisit();
      unsubscribeClick();
    };
  }, [triggerRefresh]);

  useEffect(() => {
    const getBiositeId = () => {
      const cookieBiositeId = Cookies.get("biositeId");
      if (cookieBiositeId) {
        setBiositeId(cookieBiositeId);
        console.log("📍 BiositeId from cookie:", cookieBiositeId);
        return;
      }

      const token = Cookies.get("accessToken");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          console.log("🔑 UserId from token:", payload.id);
        } catch (error) {
          console.error("❌ Error decoding token:", error);
        }
      }
    };

    getBiositeId();
  }, []);

  const fetchAnalyticsData = useCallback(async () => {
    if (!biositeId) {
      console.log("⏳ Waiting for biositeId...");
      return;
    }

    try {
      setError(null);
      console.log("🔄 Fetching analytics data...", {
        biositeId,
        timeRange,
        refreshTrigger,
        lastRefresh: lastRefresh.toISOString(),
      });

      const token = Cookies.get("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      let userId = Cookies.get("userId");
      if (!userId) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          userId = payload.id;
          console.log("🆔 UserId from token:", userId);
        } catch (decodeError) {
          console.error("❌ Error decoding token:", decodeError);
          throw new Error("Could not get userId");
        }
      }

      if (!userId) {
        throw new Error("Could not get userId");
      }

      const analyticsResult = await getBiositeAnalytics(userId, timeRange);
      console.log("📈 Analytics API result:", analyticsResult);

      if (
        typeof analyticsResult === "string" &&
        analyticsResult.includes("<!doctype html>")
      ) {
        console.warn("⚠️ API returned HTML instead of JSON");
        setAnalyticsData({
          dailyActivity: [
            {
              day: new Date().toISOString().split("T")[0],
              views: 0,
              clicks: 0,
            },
          ],
          clickDetails: [],
          views: 0,
          clicks: 0,
        });
      } else if (analyticsResult && typeof analyticsResult === "object") {
        const processedData = {
          dailyActivity:
            analyticsResult.dailyActivity &&
            analyticsResult.dailyActivity.length > 0
              ? analyticsResult.dailyActivity
              : [
                  {
                    day: new Date().toISOString().split("T")[0],
                    views: analyticsResult.views || 0,
                    clicks: analyticsResult.clicks || 0,
                  },
                ],
          clickDetails: analyticsResult.clickDetails || [],
          views: analyticsResult.views || 0,
          clicks: analyticsResult.clicks || 0,
        };

        console.log("✅ Processed analytics data:", processedData);
        setAnalyticsData(processedData);
      } else {
        console.warn("⚠️ Invalid analytics result:", analyticsResult);
        setAnalyticsData({
          dailyActivity: [
            {
              day: new Date().toISOString().split("T")[0],
              views: 0,
              clicks: 0,
            },
          ],
          clickDetails: [],
          views: 0,
          clicks: 0,
        });
      }
    } catch (error) {
      console.error("❌ Error fetching analytics data:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [biositeId, timeRange, refreshTrigger, lastRefresh]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const formatDateForDisplay = (dateStr: string, timeRange: TimeRange) => {
    const date = new Date(dateStr);

    if (timeRange === "lastYear") {
      // For yearly view, show month name
      return date.toLocaleDateString("es-ES", {
        month: "short",
        year: "numeric",
      });
    } else if (timeRange === "last30") {
      // For 30-day view, show day and month
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
      });
    } else {
      // For 7-day view, show weekday
      return date.toLocaleDateString("es-ES", {
        weekday: "short",
        day: "2-digit",
      });
    }
  };

  const handleManualRefresh = useCallback(() => {
    console.log("🔄 Manual refresh triggered");
    setLoading(true);
    triggerRefresh();
  }, [triggerRefresh]);

  const totalViews = analyticsData?.views || 0;
  const totalClicks = analyticsData?.clicks || 0;
  const ctr = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

  if (loading) {
    return (
      <div className="text-white p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-white p-6">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <h3 className="text-red-400 font-semibold mb-2">
            Error Loading Analytics
          </h3>
          <p className="text-red-300 mb-4">{error}</p>

          {/* Botón de retry */}
          <button
            onClick={handleManualRefresh}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm transition-colors"
          >
            Retry
          </button>

          {analyticsContext && (
            <div className="mt-4 text-sm border-t border-red-500 pt-4">
              <p className="text-gray-400">Debug Info:</p>
              <p className="text-gray-300">
                BiositeId: {biositeId || "Not set"}
              </p>
              <p className="text-gray-300">Time Range: {timeRange}</p>
              <p className="text-gray-300">
                Has tracked visit:{" "}
                {analyticsContext.hasTrackedVisit ? "Yes" : "No"}
              </p>
              <p className="text-gray-300">Refresh trigger: {refreshTrigger}</p>
              <p className="text-gray-300">
                Last refresh: {lastRefresh.toLocaleTimeString()}
              </p>
              <button
                onClick={() => {
                  analyticsContext.resetTracking();
                  handleManualRefresh();
                }}
                className="mt-2 px-3 py-1 bg-yellow-600 rounded text-white text-xs"
              >
                Reset & Refresh
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-white p-6">
        <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4">
          <h3 className="text-yellow-400 font-semibold mb-2">
            No Analytics Data
          </h3>
          <p className="text-yellow-300 mb-4">Unable to load analytics data.</p>

          <button
            onClick={handleManualRefresh}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-white text-sm transition-colors"
          >
            Refresh Data
          </button>

          {analyticsContext && (
            <div className="mt-4 text-sm border-t border-yellow-500 pt-4">
              <p className="text-gray-400">Debug Info:</p>
              <p className="text-gray-300">
                BiositeId: {biositeId || "Not set"}
              </p>
              <p className="text-gray-300">Time Range: {timeRange}</p>
              <p className="text-gray-300">
                Has tracked visit:{" "}
                {analyticsContext.hasTrackedVisit ? "Yes" : "No"}
              </p>
              <p className="text-gray-300">Refresh trigger: {refreshTrigger}</p>
              <p className="text-gray-300">
                Last refresh: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full text-white px-4 py-2 lg:px-6 lg:py-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-medium font-bold text-gray-800 mb-5 uppercase tracking-wide text-start sr-only sm:not-sr-only">
              Estadísticas
            </h1>

            {/* Selector de rango de tiempo */}
            <select
              value={timeRange}
              onChange={(e) =>
                handleTimeRangeChange(e.target.value as TimeRange)
              }
              className="px-3 py-2 bg-white border border-gray-600 rounded text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-[#98C022] transition-colors"
            >
              {timeRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            {/* Botón de compartir */}
            <button
              onClick={handleShare}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm transition-colors flex items-center cursor-pointer"
              title="Compartir métricas"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
              Compartir
            </button>

            {/* Botón de descarga PDF */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm transition-colors flex items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Descargar reporte PDF"
            >
              {isDownloading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              )}
              {isDownloading ? "Generando..." : "PDF"}
            </button>

            {/* Botón de actualizar */}
            <button
              onClick={handleManualRefresh}
              className="px-3 py-1 bg-[#98C022] hover:bg-[#86A81E] rounded text-white text-sm transition-colors flex items-center cursor-pointer"
              disabled={loading}
              title="Actualizar datos"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
              Actualizar
            </button>
          </div>
        </div>

        {/* VISTA MÓVIL */}
        <div className="lg:hidden">
          <div className="space-y-6">
            {/* Card de Actividad Total para móvil */}
            <div className="bg-[#1C1C1C] rounded-2xl p-6">
              <h2 className="text-lg font-medium text-white mb-4">
                Actividad Total
              </h2>
              <div className="bg-black/50 p-4 rounded-lg">
                <div className="flex justify-around items-center text-center">
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {totalViews}
                    </p>
                    <p className="text-xs text-gray-500">Vistas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {totalClicks}
                    </p>
                    <p className="text-xs text-gray-500">Clicks</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{ctr}%</p>
                    <p className="text-xs text-gray-500">CTR</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card de actividad diaria para móvil */}
            <div className="bg-[#1C1C1C] rounded-2xl p-6">
              <h2 className="text-lg font-medium text-white mb-4">
                Actividad {timeRange === "lastYear" ? "Mensual" : "Diaria"}
              </h2>
              <div className="space-y-3">
                {analyticsData.dailyActivity.map((activity, index) => (
                  <div key={index} className="bg-black/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">
                        {activity.day}
                      </span>
                      <div className="flex gap-4 text-sm">
                        <span className="text-gray-400">
                          👁️ {activity.views}
                        </span>
                        <span className="text-gray-400">
                          👆 {activity.clicks}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card de Clics por enlace para móvil */}
            <div className="bg-[#1C1C1C] rounded-2xl p-6">
              <h2 className="text-lg font-medium text-white mb-4">
                Clicks por Link
              </h2>
              {analyticsData.clickDetails &&
              analyticsData.clickDetails.length > 0 ? (
                <div className="bg-black/50 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <tbody>
                      {analyticsData.clickDetails.map((click, index) => (
                        <tr
                          key={`${click.label}-${index}`}
                          className="border-b border-gray-800 last:border-b-0"
                        >
                          <td className="px-4 py-3 text-white text-sm">
                            {click.label}
                          </td>
                          <td className="px-4 py-3 text-white font-semibold text-right">
                            {click.count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-black/50 p-6 rounded-lg text-center">
                  <p className="text-gray-400">No click data available yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* VISTA DESKTOP */}
        <div className="hidden lg:block">
          <div className="relative flex items-center justify-center mb-16">
            <div
              className="absolute transform rounded-full flex flex-col items-center justify-center"
              style={{ height: "700px", width: "700px" }}
            >
              <svg
                width="900"
                height="900"
                viewBox="0 0 900 900"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g filter="url(#filter0_d_2019_354)">
                  <circle cx="429" cy="425" r="416" fill="white" />
                </g>
                <defs>
                  <filter
                    id="filter0_d_2019_354"
                    x="0"
                    y="0"
                    width="900"
                    height="900"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feMorphology
                      radius="3"
                      operator="dilate"
                      in="SourceAlpha"
                      result="effect1_dropShadow_2019_354"
                    />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="5" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.03 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="BackgroundImageFix"
                      result="effect1_dropShadow_2019_354"
                    />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="effect1_dropShadow_2019_354"
                      result="shape"
                    />
                  </filter>
                </defs>
              </svg>
            </div>

            <div className="absolute left-24 top-1/3 transform -translate-y-1/2 w-44 h-44 bg-[#E8FAD5] border border-gray-400 rounded-full flex flex-col items-center justify-center">
              <div className="text-xs text-black mb-1">VISTAS</div>
              <div className="text-4xl font-bold text-black">{totalViews}</div>
            </div>

            <div className="z-10 overflow-y-hidden w-[350px] h-[700px] ">
                <NewBiositePage slug={biosite.slug} />
            </div>

            <div className="absolute right-30 top-52 w-38 h-38 bg-[#E8FAD5] border border-gray-400 rounded-full flex flex-col items-center justify-center">
              <div className="text-xs text-black mb-1">CLICKS</div>
              <div className="text-2xl font-bold text-black">{totalClicks}</div>
            </div>

            <div className="absolute right-40 bottom-40 w-32 h-32 bg-[#E8FAD5] border border-gray-400 rounded-full flex flex-col items-center justify-center">
              <div className="text-xs text-black mb-1">CTR</div>
              <div className="text-2xl font-bold text-black">{ctr}%</div>
            </div>
            <div className="absolute left-60 top-22 w-13 h-13 bg-[#E8FAD5] border border-gray-400 rounded-full flex flex-col items-center justify-center"></div>

            <div className="absolute left-58 bottom-38 w-10 h-10 bg-[#E8FAD5] border border-gray-400 rounded-full flex flex-col items-center justify-center"></div>
          </div>

          <div className="flex flex-wrap gap-5">
            <div className="bg-white rounded-3xl p-10">
              <h2 className="text-xl text-gray-600 font-semibold mb-6">
                Actividad {timeRange === "lastYear" ? "Mensual" : "Diaria"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {analyticsData.dailyActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="p-6 rounded-xl border border-gray-200 bg-[#E8FAD5]"
                  >
                    <p className="text-sm text-gray-600 mb-2 ">
                      {timeRange === "lastYear" ? "Mes" : "Día"}: {activity.day}
                    </p>
                    <div className="flex justify-between items-center  w-full h-full gap-5">
                      <div>
                        <p className="text-lg font-semibold text-gray-600">
                          {activity.views}
                        </p>
                        <p className="text-xs text-gray-500">Vistas</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-600">
                          {activity.clicks}
                        </p>
                        <p className="text-xs text-gray-500">Clicks</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-10">
              <h2 className="text-xl text-gray-600 font-semibold mb-6">
                Clicks por Link
              </h2>
              {analyticsData.clickDetails &&
              analyticsData.clickDetails.length > 0 ? (
                <div className=" rounded-xl border border-[#2a2a2a] overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="">
                      <tr>
                        <th className="px-6 py-4 text-gray-400 font-medium">
                          Link
                        </th>
                        <th className="px-6 py-4 text-gray-400 font-medium">
                          Clicks
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.clickDetails.map((click, index) => (
                        <tr
                          key={`${click.label}-${index}`}
                          className={
                            index % 2 === 0 ? "bg-[#E8FAD5]" : "bg-[#E8FAD5]"
                          }
                        >
                          <td className="px-6 py-4 text-gray-600">
                            {click.label}
                          </td>
                          <td className="px-6 py-4 text-gray-600 font-semibold">
                            {click.count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 rounded-xl text-center border-2 border-dashed border-gray-300">
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-gray-500 mb-2">
                    No click data available yet
                  </p>
                  <p className="text-gray-400 text-sm">
                    Click data will appear here once users interact with your
                    links
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="h-10"></div>
    </div>
  );
};

// Componente principal con wrapper opcional
const Analytics = () => {
  const [biositeId, setBiositeId] = useState<string | undefined>();

  useEffect(() => {
    const cookieBiositeId = Cookies.get("biositeId");
    if (cookieBiositeId) {
      setBiositeId(cookieBiositeId);
      console.log("🔧 Analytics initialized with biositeId:", cookieBiositeId);
    }
  }, []);

  if (biositeId) {
    return (
      <AnalyticsWrapper biositeId={biositeId} isPublicView={false}>
        <AnalyticsContent />
      </AnalyticsWrapper>
    );
  }

  return <AnalyticsContent />;
};

export default Analytics;
