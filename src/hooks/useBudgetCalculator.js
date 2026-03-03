import { useMemo } from 'react';

export const useBudgetCalculator = (cycle, transactions = []) => {
  return useMemo(() => {
    if (!cycle) return [];

    const data = [];
    let saldoArrastre = 0;
    let totalGastadoAcumulado = 0;
    let totalIngresosAcumulado = 0; // Nueva variable para seguimiento diario
    let baseActual = cycle.baseDiariaFija;

    // Descomponer fecha inicial
    const [year, month, day] = cycle.fechaInicio.split('-').map(Number);

    for (let i = 0; i < cycle.diasTotales; i++) {
      // Calcular fecha de la fila
      const f = new Date(year, month - 1, day + i);
      const fechaString = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;

      // 1. Filtrar movimientos de este día específico
      const hoy = transactions.filter(t => t.fecha === fechaString);
      const gastosHoy = hoy
        .filter(t => t.tipo === 'gasto' || !t.tipo)
        .reduce((acc, curr) => acc + Number(curr.monto), 0);
      
      const ingresosHoy = hoy
        .filter(t => t.tipo === 'ingreso')
        .reduce((acc, curr) => acc + Number(curr.monto), 0);

      // 2. ACUMULAR INGRESOS (Solo afectan de hoy en adelante)
      totalIngresosAcumulado += ingresosHoy;

      // 3. RECALCULO DE BASE DIARIA
      // Si hoy entró dinero, dividimos ese ingreso entre los días que faltan (incluyendo hoy)
      if (ingresosHoy > 0) {
        const diasRestantes = cycle.diasTotales - i;
        baseActual += (ingresosHoy / diasRestantes);
      }

      // 4. CÁLCULOS DE SALDOS
      const disponibleDelDia = baseActual + saldoArrastre;
      const restanteDelDia = disponibleDelDia - gastosHoy;
      
      totalGastadoAcumulado += gastosHoy;
      
      // CÁLCULO GLOBAL CORRECTO: Solo suma ingresos que ya ocurrieron hasta esta fecha
      const disponibleGlobal = (cycle.montoInicial + totalIngresosAcumulado) - totalGastadoAcumulado;

      data.push({
        dia: i + 1,
        fecha: fechaString,
        baseFija: baseActual,
        disponibleDelDia,
        gastosHoy,
        ingresosHoy, // Guardamos para referencia
        restanteDelDia,
        disponibleGlobal
      });

      // El restante de hoy es el arrastre para mañana
      saldoArrastre = restanteDelDia;
    }

    return data;
  }, [cycle, transactions]);
};