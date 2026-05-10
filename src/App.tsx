import React, { useState, useMemo, useEffect } from 'react';
import { Calculator, Fish, TrendingUp, Package, Truck, Info, Settings, AlertCircle, DollarSign, Activity } from 'lucide-react';
import './App.css';

const FormattedNumberInput = ({ value, onChange, placeholder, className }: { value: number | ''; onChange: (val: number | '') => void; placeholder?: string; className?: string }) => {
  const [localStr, setLocalStr] = useState('');
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      if (value === '') {
        setLocalStr('');
      } else {
        setLocalStr(new Intl.NumberFormat('es-CO', {
          maximumFractionDigits: 2,
          useGrouping: true
        }).format(value));
      }
    }
  }, [value, focused]);

  return (
    <input
      type="text"
      inputMode="decimal"
      className={className}
      value={focused ? localStr : (value === '' ? '' : new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2, useGrouping: true }).format(value))}
      onFocus={() => {
        setLocalStr(value === '' ? '' : value.toString());
        setFocused(true);
      }}
      onBlur={() => setFocused(false)}
      onChange={(e) => {
        const val = e.target.value.replace(/,/g, '.');
        setLocalStr(e.target.value);
        const cleanVal = val.replace(/[^\d.-]/g, '');
        if (cleanVal === '' || cleanVal === '-') {
          onChange('');
        } else {
          const num = parseFloat(cleanVal);
          if (!isNaN(num)) {
            onChange(num);
          }
        }
      }}
      placeholder={placeholder}
    />
  );
};

function App() {
  // --- Estados (Sección 1: Infraestructura) ---
  const [largo, setLargo] = useState<number | ''>('');
  const [ancho, setAncho] = useState<number | ''>('');
  const [profundidad, setProfundidad] = useState<number | ''>('');
  const [pesoCosecha, setPesoCosecha] = useState<number | ''>('');
  const [diasCultivo, setDiasCultivo] = useState<number | ''>('');
  const [mortalidad, setMortalidad] = useState<number | ''>('');
  const [numeroAlevinos, setNumeroAlevinos] = useState<number | ''>('');
  const [costoAlevino, setCostoAlevino] = useState<number | ''>('');
  const [fechaSiembra, setFechaSiembra] = useState<string>('');

  useEffect(() => {
    if (fechaSiembra) {
      const parts = fechaSiembra.split('-');
      if (parts.length === 3) {
        const start = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const diffTime = now.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDiasCultivo(diffDays > 0 ? diffDays : 0);
      }
    }
  }, [fechaSiembra]);

  // --- Estados (Sección 2: Alimentación) ---
  const [cantidadAlimento, setCantidadAlimento] = useState<number | ''>('');
  const [precioAlimento, setPrecioAlimento] = useState<number | ''>('');

  // --- Estados (Sección 3: Rendimiento en Planta) ---
  const [pesoViscerasHueso, setPesoViscerasHueso] = useState<number | ''>('');

  // --- Estados (Sección 4: Logística y Operación) ---
  const [flete, setFlete] = useState<number | ''>('');
  const [manoObra, setManoObra] = useState<number | ''>('');
  const [empaque, setEmpaque] = useState<number | ''>('');

  // --- Estados (Sección 5: Comercialización) ---
  const [precioVenta, setPrecioVenta] = useState<number | ''>('');
  const [kilosVendidos, setKilosVendidos] = useState<number | ''>('');


  // --- Cálculos Automáticos ---
  const volumen = useMemo(() => {
    if (largo !== '' && ancho !== '' && profundidad !== '') {
      return largo * ancho * profundidad;
    }
    return 0;
  }, [largo, ancho, profundidad]);

  const poblacionFinal = useMemo(() => {
    if (numeroAlevinos !== '' && mortalidad !== '') {
      return numeroAlevinos * (1 - (mortalidad / 100));
    }
    return numeroAlevinos !== '' ? numeroAlevinos : 0;
  }, [numeroAlevinos, mortalidad]);

  const biomasaTotal = useMemo(() => {
    if (pesoCosecha !== '' && poblacionFinal > 0) {
      return (pesoCosecha * poblacionFinal) / 1000;
    }
    return 0;
  }, [pesoCosecha, poblacionFinal]);

  const densidad = useMemo(() => {
    if (biomasaTotal > 0 && volumen > 0) {
      return biomasaTotal / volumen;
    }
    return 0;
  }, [biomasaTotal, volumen]);

  const merma = useMemo(() => {
    if (pesoViscerasHueso !== '' && poblacionFinal > 0 && biomasaTotal > 0) {
      const pesoTotalMermaKg = (pesoViscerasHueso * poblacionFinal) / 1000;
      const porcentaje = (pesoTotalMermaKg / biomasaTotal) * 100;
      return { kg: pesoTotalMermaKg, porcentaje };
    }
    return { kg: 0, porcentaje: 0 };
  }, [pesoViscerasHueso, poblacionFinal, biomasaTotal]);

  const fca = useMemo(() => {
    if (cantidadAlimento !== '' && biomasaTotal > 0) {
      const fcaVivo = cantidadAlimento / biomasaTotal;
      const biomasaEviscerada = biomasaTotal - merma.kg;
      const fcaEviscerado = biomasaEviscerada > 0 ? cantidadAlimento / biomasaEviscerada : 0;
      return { vivo: fcaVivo, eviscerado: fcaEviscerado };
    }
    return { vivo: 0, eviscerado: 0 };
  }, [cantidadAlimento, biomasaTotal, merma.kg]);

  const financieros = useMemo(() => {
    const costoAlimento = (cantidadAlimento || 0) * (precioAlimento || 0);
    const costoFlete = flete || 0;
    const costoManoObra = manoObra || 0;
    const costoEmpaque = (empaque || 0) * poblacionFinal;
    const costoCompraAlevinos = (costoAlevino || 0) * (numeroAlevinos || 0);

    const costoTotalProduccion = costoAlimento + costoFlete + costoManoObra + costoEmpaque + costoCompraAlevinos;
    
    // Asumimos que el costo por Kg se calcula sobre el Peso de Cosecha Total (para saber cuánto costó producir 1 kg)
    const costoPorKgVivo = biomasaTotal > 0 ? costoTotalProduccion / biomasaTotal : 0;
    const biomasaEviscerada = biomasaTotal - merma.kg;
    const costoPorKgEviscerado = biomasaEviscerada > 0 ? costoTotalProduccion / biomasaEviscerada : 0;
    
    const ingresos = (precioVenta || 0) * (kilosVendidos || 0);
    const utilidadNeta = ingresos - costoTotalProduccion;
    
    const rendimientoFinanciero = costoTotalProduccion > 0 ? (utilidadNeta / costoTotalProduccion) * 100 : 0;

    // Nuevas métricas: Mortalidad y Biomasa no vendida
    const pecesMuertos = Math.max(0, (numeroAlevinos || 0) - poblacionFinal);
    const perdidaPorMortalidad = pecesMuertos * (costoAlevino || 0);

    const kilosNoVendidos = Math.max(0, biomasaTotal - (kilosVendidos || 0));
    const costoBiomasaNoVendida = kilosNoVendidos * costoPorKgVivo;
    const ingresosDejadosDePercibir = kilosNoVendidos * (precioVenta || 0);

    return {
      costoTotalProduccion,
      costoPorKgVivo,
      costoPorKgEviscerado,
      utilidadNeta,
      rendimientoFinanciero,
      perdidaPorMortalidad,
      kilosNoVendidos,
      costoBiomasaNoVendida,
      ingresosDejadosDePercibir
    };
  }, [cantidadAlimento, precioAlimento, flete, manoObra, empaque, biomasaTotal, precioVenta, kilosVendidos, poblacionFinal, costoAlevino, numeroAlevinos, merma.kg]);


  // Helper para formatear moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 2) => {
    return new Intl.NumberFormat('es-CO', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Header */}
      <header className="bg-primary-600 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center">
              <img src="/logo.png" alt="Italcol Aqua" className="h-16 w-auto object-contain drop-shadow-md" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight drop-shadow-sm">AquaTrucha</h1>
              <p className="text-primary-100 text-xs sm:text-sm font-medium">Análisis de Costos Productivos</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-primary-700 px-4 py-2 rounded-full text-sm font-medium border border-primary-500/30">
            <Calculator className="h-4 w-4" />
            <span>Calculadora Activa</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Results Dashboard (Sticky on Mobile/Tablet optionally, but we place it at the top or in a prominent grid) */}
        <div className="mb-10 bg-white rounded-3xl shadow-md3-lg p-6 sm:p-8 border-t-4 border-primary-500 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5 pointer-events-none">
            <Activity className="w-64 h-64 text-primary-500" />
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="text-primary-500" /> Panel de Resultados
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
            {/* Costo Total */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-shadow">
              <p className="text-sm font-medium text-slate-500 mb-1">Costo Total Producción</p>
              <p className="text-3xl font-bold text-slate-800 break-words">{formatCurrency(financieros.costoTotalProduccion)}</p>
            </div>
            
            {/* Costo por Kg */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-shadow">
              <p className="text-sm font-medium text-slate-500 mb-2">Costo por Kilogramo</p>
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Vivo:</span>
                  <span className="text-xl font-bold text-slate-800">{formatCurrency(financieros.costoPorKgVivo)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-2 mt-1">
                  <span className="text-sm font-medium text-slate-600">Arreglado:</span>
                  <span className="text-xl font-bold text-primary-600">{formatCurrency(financieros.costoPorKgEviscerado)}</span>
                </div>
              </div>
            </div>

            {/* Utilidad Neta */}
            <div className={`rounded-2xl p-5 border transition-shadow hover:shadow-md ${financieros.utilidadNeta >= 0 ? 'bg-accent-50/50 border-accent-100' : 'bg-red-50/50 border-red-100'}`}>
              <p className={`text-sm font-medium mb-1 ${financieros.utilidadNeta >= 0 ? 'text-accent-600' : 'text-red-600'}`}>Utilidad Neta</p>
              <p className={`text-3xl font-bold break-words ${financieros.utilidadNeta >= 0 ? 'text-accent-600' : 'text-red-600'}`}>
                {formatCurrency(financieros.utilidadNeta)}
              </p>
            </div>

            {/* Rendimiento */}
            <div className={`rounded-2xl p-5 border transition-shadow hover:shadow-md ${financieros.rendimientoFinanciero >= 0 ? 'bg-primary-50/50 border-primary-100' : 'bg-red-50/50 border-red-100'}`}>
              <p className="text-sm font-medium text-slate-500 mb-1">Rendimiento Financiero</p>
              <p className={`text-3xl font-bold ${financieros.rendimientoFinanciero >= 0 ? 'text-primary-600' : 'text-red-600'}`}>
                {formatNumber(financieros.rendimientoFinanciero, 2)}%
              </p>
            </div>
          </div>

          {/* Análisis Adicional de Pérdidas */}
          {(financieros.perdidaPorMortalidad > 0 || financieros.kilosNoVendidos > 0) && (
            <div className="mt-8 pt-6 border-t border-slate-100/50">
              <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" /> Análisis de Eficiencia y Pérdidas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {financieros.perdidaPorMortalidad > 0 && (
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Mortalidad Económica</p>
                    <p className="text-2xl font-bold text-amber-700">{formatCurrency(financieros.perdidaPorMortalidad)}</p>
                    <p className="text-xs text-amber-600/80 mt-1">Costo directo por pérdida de alevinos.</p>
                  </div>
                )}
                {financieros.kilosNoVendidos > 0 && (
                  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Lucro Cesante (No vendido)</p>
                    <p className="text-2xl font-bold text-red-700">{formatCurrency(financieros.ingresosDejadosDePercibir)}</p>
                    <p className="text-xs text-red-600/80 mt-1">Ingresos dejados de percibir por {formatNumber(financieros.kilosNoVendidos)} kg restantes.</p>
                  </div>
                )}
                {financieros.costoBiomasaNoVendida > 0 && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Costo Atrapado</p>
                    <p className="text-2xl font-bold text-slate-700">{formatCurrency(financieros.costoBiomasaNoVendida)}</p>
                    <p className="text-xs text-slate-500 mt-1">Costo de producción de la biomasa no vendida.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Columna Izquierda */}
          <div className="space-y-8">
            
            {/* Sección 1: Infraestructura */}
            <section className="bg-white rounded-2xl shadow-md3 p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Settings className="w-5 h-5 text-slate-400" /> 1. Infraestructura y Cosecha
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="input-label">Largo (m)</label>
                  <FormattedNumberInput className="input-field" value={largo} onChange={setLargo} placeholder="Ej. 10" />
                </div>
                <div>
                  <label className="input-label">Ancho (m)</label>
                  <FormattedNumberInput className="input-field" value={ancho} onChange={setAncho} placeholder="Ej. 5" />
                </div>
                <div>
                  <label className="input-label">Profundidad (m)</label>
                  <FormattedNumberInput className="input-field" value={profundidad} onChange={setProfundidad} placeholder="Ej. 1.2" />
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-6 flex justify-between items-center border border-slate-100">
                <span className="text-slate-600 font-medium">Volumen Total Calculado:</span>
                <span className="text-xl font-bold text-primary-600">{formatNumber(volumen)} m³</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Peso prom. cosecha (gr)</label>
                  <FormattedNumberInput className="input-field" value={pesoCosecha} onChange={setPesoCosecha} placeholder="Gramos por pez (ej. 350)" />
                </div>
                <div>
                  <label className="input-label">Número de alevinos</label>
                  <FormattedNumberInput className="input-field" value={numeroAlevinos} onChange={setNumeroAlevinos} placeholder="Cantidad inicial" />
                </div>
                <div>
                  <label className="input-label">Costo por alevino</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                    <FormattedNumberInput className="input-field pl-10" value={costoAlevino} onChange={setCostoAlevino} placeholder="Valor de un alevino" />
                  </div>
                  {costoAlevino !== '' && numeroAlevinos !== '' && (
                    <p className="text-xs text-slate-500 mt-2 font-medium flex justify-between">
                      <span>Total compra:</span>
                      <span className="font-bold text-slate-700">{formatCurrency(Number(costoAlevino) * Number(numeroAlevinos))}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="input-label">Fecha de siembra</label>
                  <input type="date" className="input-field" value={fechaSiembra} onChange={e => setFechaSiembra(e.target.value)} />
                </div>
                <div>
                  <label className="input-label">Días de cultivo</label>
                  <FormattedNumberInput className="input-field" value={diasCultivo} onChange={setDiasCultivo} placeholder="Ej. 180" />
                  {diasCultivo !== '' && pesoCosecha !== '' && Number(diasCultivo) > 0 && (
                    <p className="text-xs text-slate-500 mt-2 font-medium flex justify-between">
                      <span>Ganancia diaria:</span>
                      <span className="font-bold text-slate-700">{formatNumber(Number(pesoCosecha) / Number(diasCultivo), 2)} gr/día</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="input-label">% Mortalidad</label>
                  <FormattedNumberInput className="input-field" value={mortalidad} onChange={setMortalidad} placeholder="Ej. 5" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-primary-50 rounded-xl p-4 flex flex-col justify-center border border-primary-100">
                  <span className="text-primary-700 font-medium text-sm mb-1 flex items-center gap-1">Biomasa Estimada <Info className="w-3 h-3 opacity-50" /></span>
                  <span className="text-2xl font-bold text-primary-700">{formatNumber(biomasaTotal)} kg</span>
                </div>
                <div className="bg-primary-50 rounded-xl p-4 flex flex-col justify-center border border-primary-100">
                  <span className="text-primary-700 font-medium text-sm mb-1 flex items-center gap-1">Densidad Cosecha <Info className="w-3 h-3 opacity-50" /></span>
                  <span className="text-2xl font-bold text-primary-700">{formatNumber(densidad)} kg/m³</span>
                </div>
              </div>
            </section>

            {/* Sección 3: Rendimiento en Planta */}
            <section className="bg-white rounded-2xl shadow-md3 p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Activity className="w-5 h-5 text-slate-400" /> 3. Rendimiento en Planta
              </h3>
              
              <div className="mb-6">
                <label className="input-label">Peso de vísceras y hueso (gr / pez)</label>
                <div className="relative">
                  <FormattedNumberInput className="input-field" value={pesoViscerasHueso} onChange={setPesoViscerasHueso} placeholder="Ej. 150" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">gr</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Peso promedio de residuos por cada pez procesado.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className="block text-xs text-slate-500 font-medium mb-1">Merma Total</span>
                  <span className="text-xl font-bold text-slate-800">{formatNumber(merma.kg)} kg <span className="text-sm font-normal text-slate-500 ml-1">({formatNumber(merma.porcentaje)}%)</span></span>
                </div>
                <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
                  <span className="block text-xs text-primary-600 font-medium mb-1">Biomasa Arreglada</span>
                  <span className="text-xl font-bold text-primary-700">{formatNumber(biomasaTotal - merma.kg)} kg</span>
                </div>
              </div>
            </section>

          </div>

          {/* Columna Derecha */}
          <div className="space-y-8">
            
            {/* Sección 2: Alimentación */}
            <section className="bg-white rounded-2xl shadow-md3 p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Package className="w-5 h-5 text-slate-400" /> 2. Alimentación (Italcol)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="input-label">Cantidad de alimento (kg)</label>
                  <FormattedNumberInput className="input-field" value={cantidadAlimento} onChange={setCantidadAlimento} placeholder="Total en kg" />
                </div>
                <div>
                  <label className="input-label">Precio del alimento / kg</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                    <FormattedNumberInput className="input-field pl-10" value={precioAlimento} onChange={setPrecioAlimento} placeholder="Precio en COP" />
                  </div>
                </div>
              </div>

              <div className="bg-accent-50 rounded-xl p-5 flex flex-col border border-accent-100 gap-4 mt-6">
                <div>
                  <span className="text-accent-700 font-bold block mb-1">Conversión Alimenticia (FCA)</span>
                  <span className="text-xs text-accent-600/80 block">Relación de Alimento / Biomasa</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/60 rounded-lg p-3 text-center border border-accent-100">
                    <span className="text-xs font-semibold text-accent-600 uppercase tracking-wider block mb-1">Pez Vivo</span>
                    <span className="text-2xl font-bold text-accent-800">{formatNumber(fca.vivo, 2)}</span>
                  </div>
                  <div className="bg-white/80 rounded-lg p-3 text-center border border-accent-200 shadow-sm">
                    <span className="text-xs font-semibold text-accent-700 uppercase tracking-wider block mb-1">Arreglado</span>
                    <span className="text-2xl font-bold text-accent-900">{formatNumber(fca.eviscerado, 2)}</span>
                  </div>
                </div>
                
                {fca.vivo > 0 && (
                  <div className="bg-white/50 p-3 rounded-lg text-sm font-medium text-accent-800 leading-relaxed">
                    Gastas <strong className="text-accent-900">{formatNumber(fca.vivo, 2)} kg</strong> de alimento para producir 1 kg de trucha viva, y <strong className="text-accent-900">{formatNumber(fca.eviscerado, 2)} kg</strong> para 1 kg arreglada.
                  </div>
                )}
              </div>
            </section>

            {/* Sección 4: Logística y Operación */}
            <section className="bg-white rounded-2xl shadow-md3 p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Truck className="w-5 h-5 text-slate-400" /> 4. Logística y Operación
              </h3>
              
              <div className="bg-slate-50 text-slate-600 text-sm p-4 rounded-xl mb-6 border border-slate-200">
                <p className="font-medium text-slate-700 mb-2 flex items-center gap-1.5"><Info className="w-4 h-4 text-primary-500" /> Consideraciones importantes:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>El costo de <strong>flete</strong> y <strong>mano de obra</strong> corresponde al total de la biomasa vendida.</li>
                  <li>Normalmente se cuenta <strong>una trucha por empaque</strong>.</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="input-label">Flete</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                    <FormattedNumberInput className="input-field pl-10" value={flete} onChange={setFlete} placeholder="Viaje de la finca al puesto de venta (ej. Cenabastos)" />
                  </div>
                </div>
                <div>
                  <label className="input-label">Mano de obra</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                    <FormattedNumberInput className="input-field pl-10" value={manoObra} onChange={setManoObra} placeholder="Pago por proceso de arreglado de la trucha" />
                  </div>
                </div>
                <div>
                  <label className="input-label">Costo por empaque</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                    <FormattedNumberInput className="input-field pl-10" value={empaque} onChange={setEmpaque} placeholder="Valor por unidad de empaque" />
                  </div>
                  {empaque !== '' && poblacionFinal > 0 && (
                    <p className="text-xs text-slate-500 mt-2 font-medium flex justify-between">
                      <span>Total estimado:</span>
                      <span className="font-bold text-slate-700">{formatCurrency(Number(empaque) * poblacionFinal)}</span>
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Sección 5: Comercialización */}
            <section className="bg-white rounded-2xl shadow-md3 p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                <DollarSign className="w-5 h-5 text-slate-400" /> 5. Comercialización
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Precio de venta / kg</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                    <FormattedNumberInput className="input-field pl-10" value={precioVenta} onChange={setPrecioVenta} placeholder="Ej. 18000" />
                  </div>
                </div>
                <div>
                  <label className="input-label">Kilos vendidos</label>
                  <FormattedNumberInput className="input-field" value={kilosVendidos} onChange={setKilosVendidos} placeholder="Total vendido (kg)" />
                </div>
              </div>
            </section>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center space-y-6">
          <div className="bg-white/5 p-4 rounded-3xl mb-2 backdrop-blur-sm border border-white/10 shadow-inner">
            <img src="/logo.png" alt="Italcol Aqua" className="h-16 w-auto object-contain drop-shadow-xl" />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-2 mt-2">
            <a href="https://wa.me/573165594787" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-3 rounded-full font-medium transition-colors shadow-lg hover:shadow-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
              </svg>
              <span>Contactar a <strong>Miguel Rico</strong></span>
            </a>
            <a href="https://wa.me/573158049590" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-3 rounded-full font-medium transition-colors shadow-lg hover:shadow-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
              </svg>
              <span>Contactar a <strong>Freddy Caicedo</strong></span>
            </a>
          </div>

          <p className="max-w-2xl text-sm leading-relaxed">
            Desarrollo por <strong className="text-slate-200">Miguel Rico</strong> (Gerente de Zona Provincia de Pamplona) y <strong className="text-slate-200">Freddy Caicedo</strong> (Especialista de Acuicultura), <strong className="text-primary-400">Italcol</strong>.
          </p>
          <div className="w-16 h-1 bg-primary-600/50 rounded-full mt-4"></div>
        </div>
      </footer>

    </div>
  );
}

export default App;
