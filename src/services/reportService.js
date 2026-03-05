import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePDFReport = (cycle, tableData, user) => {
  const doc = jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // 1. Encabezado del Reporte
  doc.setFontSize(18);
  doc.setTextColor(44, 62, 80);
  doc.text(`Reporte: ${cycle.nombre || 'Ciclo Financiero'}`, 14, 20);
  
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Perfil: ${user.displayName} | Generado: ${new Date().toLocaleDateString()}`, 14, 26);

  // 2. Cálculos Estadísticos
  const totalGastado = tableData.reduce((acc, curr) => acc + curr.gastosHoy, 0);
  const totalFijos = (cycle.ingresoTotal - cycle.montoInicial);
  const saldoFinal = tableData[tableData.length - 1].disponibleGlobal;
  const diasEnRojo = tableData.filter(d => d.restanteDelDia < 0).length;

  // 3. Cuadro Resumen Ejecutivo
  doc.setDrawColor(200);
  doc.setFillColor(248, 249, 250);
  doc.rect(14, 32, pageWidth - 28, 35, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Ingreso Inicial: Q${cycle.ingresoTotal?.toFixed(2)}`, 20, 40);
  doc.text(`(-) Pagos Fijos: Q${totalFijos.toFixed(2)}`, 20, 47);
  doc.text(`(-) Gastos Diarios: Q${totalGastado.toFixed(2)}`, 20, 54);
  doc.setFont("helvetica", "bold");
  doc.text(`SALDO FINAL: Q${saldoFinal.toFixed(2)}`, 20, 62);

  doc.setFont("helvetica", "normal");
  doc.text("Resumen de Disciplina:", 125, 40);
  doc.setTextColor(diasEnRojo > 0 ? 231 : 46, 76, 60);
  doc.text(`• Días con déficit: ${diasEnRojo}`, 125, 47);
  doc.setTextColor(0);
  doc.text(`• Duración del plan: ${cycle.diasTotales} días`, 125, 54);

  // 4. TABLA DE GASTOS FIJOS (NUEVA SECCIÓN EN EL PDF)
  if (cycle.gastosFijos && cycle.gastosFijos.length > 0) {
    doc.setFontSize(11);
    doc.setTextColor(44, 62, 80);
    doc.text("Detalle de Pagos Fijos Iniciales:", 14, 78);
    
    autoTable(doc, {
      startY: 82,
      head: [['Motivo de Pago Fijo', 'Monto']],
      body: cycle.gastosFijos.map(g => [g.motivo, `Q${parseFloat(g.monto).toFixed(2)}`]),
      theme: 'grid',
      headStyles: { fillColor: [52, 73, 94] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 100 } // Tabla estrecha a la izquierda
    });
  }

  // 5. TABLA DE DETALLES DIARIOS
  const tableStartY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 85;
  doc.setFontSize(11);
  doc.setTextColor(44, 62, 80);
  doc.text("Seguimiento de Gastos Diarios:", 14, tableStartY - 3);

  autoTable(doc, {
    startY: tableStartY,
    head: [['Día', 'Fecha', 'Base', 'Disponible', 'Gastos', 'Restante', 'Global']],
    body: tableData.map(row => [
      row.dia,
      row.fecha,
      `Q${row.baseFija.toFixed(2)}`,
      `Q${row.disponibleDelDia.toFixed(2)}`,
      `Q${row.gastosHoy.toFixed(2)}`,
      `Q${row.restanteDelDia.toFixed(2)}`,
      `Q${row.disponibleGlobal.toFixed(2)}`
    ]),
    headStyles: { fillColor: [44, 62, 80], halign: 'center', fontSize: 8 },
    bodyStyles: { halign: 'center', fontSize: 7 },
    columnStyles: {
      3: { fontStyle: 'bold' },
      5: { fontStyle: 'bold' },
      6: { fontStyle: 'bold', textColor: [39, 174, 96] }
    }
  });

  doc.save(`Reporte_Completo_${cycle.fechaInicio}.pdf`);
};