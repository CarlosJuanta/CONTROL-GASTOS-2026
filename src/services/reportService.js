import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePDFReport = (cycle, tableData, user) => {
  const doc = jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // 1. Encabezado del Reporte
  doc.setFontSize(20);
  doc.setTextColor(44, 62, 80);
  doc.text("Reporte de Gastos - Ciclo Financiero", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Perfil: ${user.displayName}`, 14, 30);
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 35);

  // 2. Cálculos Estadísticos Detallados
  const totalGastado = tableData.reduce((acc, curr) => acc + curr.gastosHoy, 0);
  const totalIngresosExtra = tableData.reduce((acc, curr) => acc + (curr.ingresosHoy || 0), 0);
  const saldoFinal = tableData[tableData.length - 1].disponibleGlobal;
  
  // Días con saldo negativo (Rojo en la app)
  const diasEnRojo = tableData.filter(d => d.restanteDelDia < 0).length;
  
  // Días que gastaste más de la base fija (Naranja/Verde en la app)
  const diasExcesoBase = tableData.filter(d => d.gastosHoy > d.baseFija).length;

  // 3. Cuadro Resumen Ejecutivo
  doc.setDrawColor(200);
  doc.setFillColor(248, 249, 250);
  doc.rect(14, 45, pageWidth - 28, 42, 'F');
  doc.rect(14, 45, pageWidth - 28, 42);
  
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text(`Presupuesto Inicial: Q${cycle.montoInicial.toFixed(2)}`, 20, 55);
  doc.text(`Ingresos Extra: Q${totalIngresosExtra.toFixed(2)}`, 20, 62);
  doc.text(`Total Gastado: Q${totalGastado.toFixed(2)}`, 20, 69);
  doc.setFont("helvetica", "bold");
  doc.text(`Saldo Final Global: Q${saldoFinal.toFixed(2)}`, 20, 78);

  // SECCIÓN DE RENDIMIENTO (Estadísticas que faltaban)
  doc.setFont("helvetica", "normal");
  doc.text("Rendimiento del Ciclo:", 125, 55);
  
  doc.setTextColor(231, 76, 60); // Rojo para déficit
  doc.text(`• Días con déficit: ${diasEnRojo}`, 125, 62);
  
  doc.setTextColor(243, 156, 18); // Naranja para exceso de base
  doc.text(`• Excesos de base diaria: ${diasExcesoBase}`, 125, 69);
  
  doc.setTextColor(0);
  doc.text(`• Duración: ${cycle.diasTotales} días`, 125, 76);
  
  // 4. Tabla de Detalles (7 columnas: incluyendo Disponible)
  autoTable(doc, {
    startY: 95,
    head: [['Día', 'Fecha', 'Base Diaria', 'Disponible', 'Gastos', 'Restante Hoy', 'Saldo Global']],
    body: tableData.map(row => [
      row.dia,
      row.fecha,
      `Q${row.baseFija.toFixed(2)}`,
      `Q${row.disponibleDelDia.toFixed(2)}`,
      `Q${row.gastosHoy.toFixed(2)}`,
      `Q${row.restanteDelDia.toFixed(2)}`,
      `Q${row.disponibleGlobal.toFixed(2)}`
    ]),
    headStyles: { 
      fillColor: [44, 62, 80], 
      halign: 'center', 
      fontSize: 8 
    },
    bodyStyles: { 
      halign: 'center', 
      fontSize: 7.5 
    },
    alternateRowStyles: { 
      fillColor: [245, 245, 245] 
    },
    columnStyles: {
      3: { fontStyle: 'bold' }, // Disponible
      4: { fontStyle: 'bold' }, // Gastos
      5: { fontStyle: 'bold' }, // Restante Hoy
      6: { fontStyle: 'bold', textColor: [39, 174, 96] } // Saldo Global Verde
    },
    margin: { left: 10, right: 10 }
  });

  // 5. Pie de página
  const finalY = doc.lastAutoTable.finalY || 150;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("Generado automáticamente por la App Control de Gastos 2026.", 14, finalY + 15);

  // Descargar archivo
  doc.save(`Resumen_Gastos_${cycle.fechaInicio}.pdf`);
};