import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Importación explícita corregida

export const generatePDFReport = (cycle, tableData, user) => {
  const doc = jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // 1. Encabezado del Reporte
  doc.setFontSize(20);
  doc.setTextColor(44, 62, 80);
  doc.text("Resumen de Gastos - Ciclo Financiero", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Usuario: ${user.displayName}`, 14, 30);
  doc.text(`Fecha de impresión: ${new Date().toLocaleDateString()}`, 14, 35);

  // 2. Cálculo de Estadísticas
  const totalGastado = tableData.reduce((acc, curr) => acc + curr.gastosHoy, 0);
  const totalIngresosExtra = tableData.reduce((acc, curr) => acc + (curr.ingresosHoy || 0), 0);
  const saldoFinal = tableData[tableData.length - 1].disponibleGlobal;
  const diasEnRojo = tableData.filter(d => d.restanteDelDia < 0).length;
  const diasExcesoBase = tableData.filter(d => d.gastosHoy > d.baseFija).length;

  // 3. Cuadro de Resumen Ejecutivo
  doc.setDrawColor(200);
  doc.setFillColor(248, 249, 250);
  doc.rect(14, 45, pageWidth - 28, 40, 'F');
  doc.rect(14, 45, pageWidth - 28, 40);
  
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Presupuesto Inicial: Q${cycle.montoInicial.toFixed(2)}`, 20, 55);
  doc.text(`Ingresos Extra: Q${totalIngresosExtra.toFixed(2)}`, 20, 62);
  doc.text(`Total Gastado: Q${totalGastado.toFixed(2)}`, 20, 69);
  doc.setFont("helvetica", "bold");
  doc.text(`Saldo Final Disponible: Q${saldoFinal.toFixed(2)}`, 20, 78);

  // 4. Estadísticas de Comportamiento (Lado derecho)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Estadísticas del Ciclo:", 120, 55);
  doc.setTextColor(231, 76, 60); // Rojo
  doc.text(`• Días con sobregasto: ${diasEnRojo}`, 120, 62);
  doc.setTextColor(243, 156, 18); // Naranja
  doc.text(`• Días excediendo base fija: ${diasExcesoBase}`, 120, 69);
  
  // 5. Tabla de Detalles (Uso de autoTable como función independiente)
  autoTable(doc, {
    startY: 95,
    head: [['Día', 'Fecha', 'Base Diaria', 'Gastos', 'Restante Hoy', 'Saldo Global']],
    body: tableData.map(row => [
      row.dia,
      row.fecha,
      `Q${row.baseFija.toFixed(2)}`,
      `Q${row.gastosHoy.toFixed(2)}`,
      `Q${row.restanteDelDia.toFixed(2)}`,
      `Q${row.disponibleGlobal.toFixed(2)}`
    ]),
    headStyles: { fillColor: [44, 62, 80], halign: 'center' },
    bodyStyles: { halign: 'center' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      4: { fontStyle: 'bold' }, // Restante Hoy
      5: { fontStyle: 'bold', textColor: [39, 174, 96] } // Saldo Global verde
    }
  });

  // 6. Pie de página
  const finalY = doc.lastAutoTable.finalY || 150;
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text("Este reporte es de uso personal y se basa en los registros ingresados en la App.", 14, finalY + 15);
  doc.text("Generado por Control de Gastos 2026.", 14, finalY + 20);

  // Descargar el archivo
  doc.save(`Reporte_Gastos_${cycle.fechaInicio}.pdf`);
};