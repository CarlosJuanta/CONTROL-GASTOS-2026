import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePDFReport = (cycle, tableData, user, allExpenses) => {
  const doc = jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // 1. Encabezado del Reporte
  doc.setFontSize(18);
  doc.setTextColor(44, 62, 80);
  doc.text(`Reporte Detallado: ${cycle.nombre || 'Ciclo Financiero'}`, 14, 20);
  
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Perfil: ${user.displayName} | Generado: ${new Date().toLocaleDateString()}`, 14, 26);

  // 2. Cálculos Estadísticos
  const totalGastado = tableData.reduce((acc, curr) => acc + curr.gastosHoy, 0);
  const totalIngresosExtra = tableData.reduce((acc, curr) => acc + (curr.ingresosHoy || 0), 0);
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
  doc.text(`(-) Gastos Fijos: Q${totalFijos.toFixed(2)}`, 20, 47);
  doc.text(`(-) Gastos Diarios: Q${totalGastado.toFixed(2)}`, 20, 54);
  doc.setFont("helvetica", "bold");
  doc.text(`(+) Saldo Extra: Q${totalIngresosExtra.toFixed(2)}`, 70, 40);
  doc.text(`SALDO FINAL: Q${saldoFinal.toFixed(2)}`, 20, 62);

  doc.setFont("helvetica", "normal");
  doc.text("Resumen de Disciplina:", 125, 40);
  doc.setTextColor(diasEnRojo > 0 ? 231 : 46, 76, 60);
  doc.text(`• Días con déficit: ${diasEnRojo}`, 125, 47);
  doc.setTextColor(0);
  doc.text(`• Días totales: ${cycle.diasTotales}`, 125, 54);

  // 4. TABLA DE GASTOS FIJOS
  if (cycle.gastosFijos && cycle.gastosFijos.length > 0) {
    doc.setFontSize(11);
    doc.setTextColor(44, 62, 80);
    doc.text("1. Detalle de Gastos Fijos (Pagados al inicio):", 14, 78);
    
    autoTable(doc, {
      startY: 82,
      head: [['Motivo', 'Monto']],
      body: cycle.gastosFijos.map(g => [g.motivo, `Q${parseFloat(g.monto).toFixed(2)}`]),
      headStyles: { fillColor: [52, 73, 94] },
      styles: { fontSize: 8 },
      margin: { right: 100 }
    });
  }

  // 5. TABLA DE TODOS LOS MOVIMIENTOS INDIVIDUALES (LO QUE PEDISTE)
  const transStartY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 80;
  doc.setFontSize(11);
  doc.setTextColor(44, 62, 80);
  doc.text("2. Lista Detallada de Movimientos Diarios:", 14, transStartY - 3);

  // Ordenamos los gastos por fecha
  const gastosOrdenados = [...allExpenses].sort((a, b) => a.fecha.localeCompare(b.fecha));

  autoTable(doc, {
    startY: transStartY,
    head: [['Fecha', 'Motivo / Descripción', 'Tipo', 'Método', 'Monto']],
    body: gastosOrdenados.map(g => [
      g.fecha,
      g.motivo,
      g.tipo === 'ingreso' ? 'INGRESO EXTRA' : 'GASTO',
      g.metodo,
      `Q${parseFloat(g.monto).toFixed(2)}`
    ]),
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 8 },
    columnStyles: {
        4: { halign: 'right', fontStyle: 'bold' }
    },
    didParseCell: function(data) {
        if (data.column.index === 2 && data.cell.raw === 'INGRESO EXTRA') {
            data.cell.styles.textColor = [39, 174, 96]; // Verde para ingresos
        }
        if (data.column.index === 2 && data.cell.raw === 'GASTO') {
            data.cell.styles.textColor = [192, 57, 43]; // Rojo para gastos
        }
    }
  });

  // 6. TABLA DE RESUMEN DIARIO (PROYECCIÓN)
  const summaryStartY = doc.lastAutoTable.finalY + 15;
  doc.addPage(); // Añadimos una página nueva para el resumen diario si es muy largo
  doc.setFontSize(11);
  doc.text("3. Resumen Consolidado por Día:", 14, 20);

  autoTable(doc, {
    startY: 25,
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

  doc.save(`Reporte_Completo_${cycle.nombre}.pdf`);
};