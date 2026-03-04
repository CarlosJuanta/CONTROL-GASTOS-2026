import { useMemo } from 'react';

export const useBudgetCalculator = (cycle, transactions = []) => {
  return useMemo(() => {
    if (!cycle) return [];

    const data = [];
    let saldoArrastre = 0;
    let totalGastadoAcumulado = 0;
    let totalIngresosAcumulado = 0;
    let baseActual = cycle.baseDiariaFija;

    const [year, month, day] = cycle.fechaInicio.split('-').map(Number);

    for (let i = 0; i < cycle.diasTotales; i++) {
      const f = new Date(year, month - 1, day + i);
      const fechaString = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;

      const hoy = transactions.filter(t => t.fecha === fechaString);
      const gastosHoy = hoy.filter(t => t.tipo === 'gasto' || !t.tipo).reduce((acc, curr) => acc + Number(curr.monto), 0);
      const ingresosHoy = hoy.filter(t => t.tipo === 'ingreso').reduce((acc, curr) => acc + Number(curr.monto), 0);

      totalIngresosAcumulado += ingresosHoy;

      if (ingresosHoy > 0) {
        const diasRestantes = cycle.diasTotales - i;
        baseActual += (ingresosHoy / diasRestantes);
      }

      const disponibleDelDia = baseActual + saldoArrastre;
      const restanteDelDia = disponibleDelDia - gastosHoy;
      totalGastadoAcumulado += gastosHoy;
      
      const disponibleGlobal = (cycle.montoInicial + totalIngresosAcumulado) - totalGastadoAcumulado;

      data.push({
        dia: i + 1,
        fecha: fechaString,
        baseFija: baseActual,
        disponibleDelDia,
        gastosHoy,
        ingresosHoy,
        restanteDelDia,
        disponibleGlobal
      });

      saldoArrastre = restanteDelDia;
    }
    return data;
  }, [cycle, transactions]);
};