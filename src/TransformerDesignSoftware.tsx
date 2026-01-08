import React, { useState, useMemo, useCallback, memo } from 'react';
import { Calculator, Zap, Settings, Database, Download, FileText, Package, Layers } from 'lucide-react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';


// MOVE THIS TO THE TOP OF THE FILE (Outside the main component)
const InputField = React.memo(({ label, field, type = "text", unit = "", options, value, onChange, readOnly = false  }) => (
  <div className="mb-3">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="flex gap-2">
      {options ? (
        <select
          value={value}
disabled={readOnly} 
          onChange={(e) => onChange(field, e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value ?? ""}
readOnly={readOnly}
          onChange={(e) => onChange(field, e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      )}
      {unit && (
        <span className="px-3 py-2 bg-gray-100 border rounded-md text-sm w-16 text-center">
          {unit}
        </span>
      )}
    </div>
  </div>
));


const VECTOR_GROUP_MAP = {
  Dyn11: { primary: "Delta", secondary: "Star" },
  Dyn5: { primary: "Delta", secondary: "Star" },

  Yyn0: { primary: "Star", secondary: "Star" },
  Yyn6: { primary: "Star", secondary: "Star" },
  YNyn0: { primary: "Star", secondary: "Star" },

  Yd1: { primary: "Star", secondary: "Delta" },
  Yd11: { primary: "Star", secondary: "Delta" },

  Dd0: { primary: "Delta", secondary: "Delta" },
  Dd6: { primary: "Delta", secondary: "Delta" },

  Zyn11: { primary: "Zigzag", secondary: "Star" }
};

const TransformerDesignSoftware = () => {



  const [inputs, setInputs] = useState({
    date: '21-12-2025',
    salesOrderNumber: '9500',
    customerName: 'NTPC',
    standard: 'IEC 60076',
    rating: 2,
    primaryVoltage: 33,
    secondaryVoltage: 0.433,
    primaryConnection: 'Delta',
    secondaryConnection: 'Star',
    vectorGroup: 'Dyn11',
    positiveTapping: 5,
    negativeTapping: 10,
    tappingStepSize: 2.5,
    noOfSteps: 6,
    windingMaterial: 'Copper',
    frequency: 50,
    coolingType: 'ONAN',
    guaranteedNoLoadLosses: 4,
    guaranteedFullLoadLosses: 10,
    guaranteedImpedance: 6.25,
    designAmbientTemp: 50,
    guaranteedOilTempRise: 50,
    voltsPerTurnOverride: null,
    windowHeightOverride: null,
    legCenterOverride: null,
    secondaryTurnsOverride: null,
  coreDiameterOverride: null,
laminationThickness: 0.27,
laminationsPerPacket: 5,


    guaranteedWindingTempRise: 55
  });

  const [activeTab, setActiveTab] = useState('design');
const [currentStep, setCurrentStep] = useState(1);
const [aiResult, setAiResult] = useState('');
const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
const [aiLoading, setAiLoading] = useState(false);
const [wOverrides, setWOverrides] = useState<{ [key: string]: number }>({});


  const handleInputChange = useCallback((field, value) => {
    setInputs(prev => {
      const newInputs = { ...prev, [field]: value };

      // AUTOMATION LOGIC:
      // If the user changes the vectorGroup, look up the connections
      if (field === 'vectorGroup' && VECTOR_GROUP_MAP[value]) {
        newInputs.primaryConnection = VECTOR_GROUP_MAP[value].primary;
        newInputs.secondaryConnection = VECTOR_GROUP_MAP[value].secondary;
      }

      return newInputs;
    });
  }, []);

	
const autoNoOfSteps =
  inputs.positiveTapping &&
  inputs.negativeTapping &&
  inputs.tappingStepSize
    ? Math.round(
        inputs.positiveTapping / inputs.tappingStepSize +
        inputs.negativeTapping / inputs.tappingStepSize
      )
    : inputs.noOfSteps;

const noLoadMax =
  inputs.guaranteedNoLoadLosses
    ? (inputs.guaranteedNoLoadLosses * 1.1).toFixed(2)
    : "";

const fullLoadMax =
  inputs.guaranteedFullLoadLosses
    ? (inputs.guaranteedFullLoadLosses * 1.1).toFixed(2)
    : "";

const impedanceMin =
  inputs.guaranteedImpedance
    ? (inputs.guaranteedImpedance * 0.9).toFixed(2)
    : "";

const impedanceMax =
  inputs.guaranteedImpedance
    ? (inputs.guaranteedImpedance * 1.1).toFixed(2)
    : "";
const even = (value) => {
  const n = Math.ceil(value);
  return n % 2 === 0 ? n : n + 1;
};

const getFinalW = (key: string, defaultW: number) => {
  const value = wOverrides[key] ?? defaultW;
  return Math.max(60, Number(value));
};


  const calculations = useMemo(() => {

const laminationThickness =
  Number(inputs.laminationThickness) || 0.27;

const numberOfLaminationsPerPacket =
  Number(inputs.laminationsPerPacket) || 5;

const packetThickness =
  laminationThickness * numberOfLaminationsPerPacket;



    const rating = Number(inputs.rating) || 0;
const primaryVoltage = Number(inputs.primaryVoltage) || 0;
const secondaryVoltage = Number(inputs.secondaryVoltage) || 0;
const frequency = Number(inputs.frequency) || 0;

const guaranteedImpedance = Number(inputs.guaranteedImpedance) || 0;
const guaranteedNoLoadLosses = Number(inputs.guaranteedNoLoadLosses) || 0;
const guaranteedFullLoadLosses = Number(inputs.guaranteedFullLoadLosses) || 0;

const tappingStepSize = Number(inputs.tappingStepSize) || 0;
const noOfSteps = Number(inputs.noOfSteps) || 0;

const windingMaterial = inputs.windingMaterial;
const primaryConnection = inputs.primaryConnection;
const secondaryConnection = inputs.secondaryConnection;


    // Basic Electrical Calculations
    const ratingKVA = rating * 1000;

const primaryCurrent =
  primaryConnection === 'Delta'
    ? ratingKVA / (3 * primaryVoltage)
    : ratingKVA / (Math.sqrt(3) * primaryVoltage);

const secondaryCurrent =
  secondaryConnection === 'Delta'
    ? ratingKVA / (3 * secondaryVoltage)
    : ratingKVA / (Math.sqrt(3) * secondaryVoltage);

    const primaryPhaseVoltage = primaryConnection === 'Delta' ? primaryVoltage : primaryVoltage / Math.sqrt(3);
    const secondaryPhaseVoltage = secondaryConnection === 'Star' ? secondaryVoltage / Math.sqrt(3) : secondaryVoltage;
    
    // Core Design
    // Convert secondary voltage from kV to V
const secondaryVoltageV = secondaryPhaseVoltage * 1000;

// Secondary turns (user override OR default)
const secondaryTurns =
  inputs.secondaryTurnsOverride ?? 16;

// Voltage per turn (FINAL & CORRECT)
const voltsPerTurn = secondaryVoltageV / secondaryTurns;



    // ratingKVA / 3 gets kVA per phase. We multiply by 10 to convert cm to mm.
const coreDiameter =
  Number(inputs.coreDiameterOverride) ||
  Math.round(40 * Math.pow(ratingKVA, 0.25));    

    
    const primaryTurns = Math.round((primaryPhaseVoltage * 1000) / voltsPerTurn);
    
    
    const windowHeight = Number(inputs.windowHeightOverride) || (coreDiameter * 2.5);
    const legCenter = Number(inputs.legCenterOverride) || (coreDiameter * 2);
   

    
    // Winding Design - Secondary (LV)
    const secCurrentDensity = windingMaterial === 'Copper' ? 3.5 : 3.0;
   
    
    const MAX_CURRENT_PER_CONDUCTOR = 400;

// total parallel conductors
const secParallel = Math.ceil(
  secondaryCurrent / MAX_CURRENT_PER_CONDUCTOR
);
 // ✅ Current per SINGLE conductor
const secSingleCurrent = secondaryCurrent / secParallel;

// ✅ Area of SINGLE conductor
const secConductorArea = secSingleCurrent / secCurrentDensity;

const secWidth = Math.sqrt(secConductorArea * 0.8);
    const secThickness = Math.sqrt(secConductorArea * 1.2);

// width-wise (try square root)
let secWidthParallel = Math.ceil(Math.sqrt(secParallel));

// radial-wise (adjust so product >= total)
let secRadialParallel = Math.ceil(
  secParallel / secWidthParallel
);

// FINAL SAFETY CHECK
if (secWidthParallel * secRadialParallel < secParallel) {
  secRadialParallel++;
}

const secParallelUsed = secWidthParallel * secRadialParallel;

    const secPaperCovering = 0.5;
    const secWindingType = secondaryCurrent > 1000 ? 'Helical' : 'Layer';
    const secInnerDia = coreDiameter + 40;
    const secRadial = (secWidth + secPaperCovering) * secRadialParallel * secondaryTurns / windowHeight;
    const secMeanDia = secInnerDia + secRadial;
    const secOuterDia = secInnerDia + 2 * secRadial;
    const secWindingHeight = windowHeight * 0.95;
    const secMeanLength = Math.PI * secMeanDia / 1000;
    const secResistance30 = (0.0179 * secMeanLength * secondaryTurns) / (secConductorArea * secParallel);
    const secResistance75 = secResistance30 * 1.2;
    const secI2R30 = Math.pow(secondaryCurrent, 2) * secResistance30 / 1000;
    const secI2R75 = Math.pow(secondaryCurrent, 2) * secResistance75 / 1000;
    const secLeadLosses = secI2R75 * 0.05;
    const secEddyLosses = secI2R75 * 0.08;
    const secGradient = 35;
    
    // Winding Design - Primary (HV)
    const priCurrentDensity = windingMaterial === 'Copper' ? 3.0 : 2.5;
const MAX_CURRENT_PER_HV_CONDUCTOR = 200;
    const priParallel = Math.ceil(
  primaryCurrent / MAX_CURRENT_PER_HV_CONDUCTOR
);
// ✅ SECOND: current per SINGLE HV conductor
const priSingleCurrent = primaryCurrent / priParallel;

// ✅ THIRD: area of SINGLE HV conductor
const priConductorArea = priSingleCurrent / priCurrentDensity;

    const priWidth = Math.sqrt(priConductorArea * 0.9);
    const priThickness = Math.sqrt(priConductorArea * 1.1);
    const priWidthParallel = Math.ceil(Math.sqrt(priParallel));
    const priRadialParallel = Math.ceil(priParallel / priWidthParallel);
    const priPaperCovering = 0.3;
    const priWindingType = 'Layer';
    const priInnerDia = secOuterDia + 20;
    const priRadial = (priWidth + priPaperCovering) * priRadialParallel * primaryTurns / windowHeight;
    const priMeanDia = priInnerDia + priRadial;
    const priOuterDia = priInnerDia + 2 * priRadial;
    const priWindingHeight = windowHeight * 0.95;
    const priMeanLength = Math.PI * priMeanDia / 1000;
    const priResistance30 = (0.0179 * priMeanLength * primaryTurns) / (priConductorArea * priParallel);
    const priResistance75 = priResistance30 * 1.2;
    const priI2R30 = Math.pow(primaryCurrent, 2) * priResistance30 / 1000;
    const priI2R75 = Math.pow(primaryCurrent, 2) * priResistance75 / 1000;
    const priLeadLosses = priI2R75 * 0.05;
    const priEddyLosses = priI2R75 * 0.08;
    const priGradient = 30;
    
    // Total Losses and Impedance
    const totalI2R75 = secI2R75 + priI2R75;
    const totalStrayLosses = secLeadLosses + secEddyLosses + priLeadLosses + priEddyLosses;
    const totalLoadLosses = totalI2R75 + totalStrayLosses;
    
    const resistancePercent =
  (totalLoadLosses / (rating * 1000)) * 100;

const reactancePercent =
  Math.sqrt(
    Math.pow(guaranteedImpedance, 2) -
    Math.pow(resistancePercent, 2)
  );

    const impedanceNormalTap = guaranteedImpedance;
    
    // Tapping calculations
    const maxTapVoltage = primaryVoltage * (1 + (tappingStepSize * noOfSteps / 2) / 100);
    const minTapVoltage = primaryVoltage * (1 - (tappingStepSize * noOfSteps / 2) / 100);
    const tapFactor = 1.02;
    
    const priMaxTapRes30 = priResistance30 * tapFactor;
    const priMaxTapRes75 = priResistance75 * tapFactor;
    const priMaxTapI2R30 = priI2R30 * Math.pow(tapFactor, 2);
    const priMaxTapI2R75 = priI2R75 * Math.pow(tapFactor, 2);
    const impedanceMaxTap = impedanceNormalTap * 1.03;
    
    const priMinTapRes30 = priResistance30 * 0.98;
    const priMinTapRes75 = priResistance75 * 0.98;
    const priMinTapI2R30 = priI2R30 * Math.pow(0.98, 2);
    const priMinTapI2R75 = priI2R75 * Math.pow(0.98, 2);
    const impedanceMinTap = impedanceNormalTap * 0.97;
    
    // Ratio Calculations for Tapping
    const lvTurns = secondaryTurns;







// Tapping calculations for Table
const tapSteps = [];
let srNo = 1;

// Aapne inputs mein jo positive aur negative % diya hai usse steps nikalein
const positiveSteps = Math.round(inputs.positiveTapping / inputs.tappingStepSize);
const negativeSteps = Math.round(inputs.negativeTapping / inputs.tappingStepSize);

// Loop positive se negative tak chalega
for (let i = positiveSteps; i >= -negativeSteps; i--) {
  // YAHAN SE 'if (i === 0) continue;' KO HATA DIYA HAI
  // Taki 0% (Normal Tap) bhi list mein aaye

  const tapVoltage = primaryVoltage * (1 + (i * inputs.tappingStepSize) / 100);
  const cluRatio = (tapVoltage * 1000) / (secondaryPhaseVoltage * 1000);
  const cluTurns = cluRatio * lvTurns;

  // 43 ke multiple mein rounding (Jaisa aapne original code mein rakha tha)
  const actualTurns = Math.round(cluTurns / 43) * 43;
  const dTRatio = actualTurns / lvTurns;
  let error = ((actualTurns - cluTurns) / cluTurns) * 100;

// Clamp error to ±0.3
if (error > 0.3) error = 0.3;
if (error < -0.3) error = -0.3;


  tapSteps.push({
    srNo: srNo++,
    tapPercent: i > 0 ? `+${i * inputs.tappingStepSize}%` : `${i * inputs.tappingStepSize}%`,
    voltage: tapVoltage.toFixed(4),
    cluRatio: cluRatio.toFixed(7),
    cluTurns: cluTurns.toFixed(3),
    actualTurns: actualTurns,
    turnsDiff: 43,
    error: error.toFixed(2),
    dTRatio: dTRatio.toFixed(4),
    plusTenPercent: (dTRatio * 1.1).toFixed(4),
    normal: dTRatio.toFixed(4),
    minusTenPercent: (dTRatio * 0.9).toFixed(4)
  });
}





    
    // Core Cutting Schedule
        const yokePlates = [];
    const sideLimbPlates = [];
    const centerLimbPlates = [];

    // 2. Calculate the starting width (W) for the first plate
// This rounds down to the nearest 10 after subtracting 10-12mm
const startWidth = Math.floor((coreDiameter - 10) / 10) * 10;

   // Plate widths (same as before, only W list)
const plateWidths = [
  startWidth,
  startWidth - 10,
  startWidth - 20,
  startWidth - 30,
  startWidth - 40,
  startWidth - 50,
  startWidth - 70,
  startWidth - 90,
  startWidth - 110,
  startWidth - 130,
  startWidth - 150,
  startWidth - 170,
  startWidth - 190,
  startWidth - 220,
  startWidth - 250
].filter(w => w >= 60);

// CoreDia^2 (used in formula)
const coreDiaSq = coreDiameter * coreDiameter;

// Cumulative sum of previous STKs
let cumulativeStk = 0;

const plateData = plateWidths.map((w, index) => {

  // BASE = 2 * sqrt(CoreDia^2 - W^2)
  const base =
    2 * Math.sqrt(coreDiaSq - (w * w));

  let stk;

  if (index === 0) {
    // First row
    stk = base;
  } else {
    // From second row onwards
    stk = base - cumulativeStk;
  }

  // Excel ROUND( , 4 )
  stk = Math.round(stk);

  // Update cumulative sum
  cumulativeStk += stk;

  return {
    w,
    stk,
    step: 20
  };
});

    
    plateData.forEach((plate, idx) => {
const wFinal = getFinalW(`yoke-${idx}`, plate.w);

      const d1 = legCenter * 2 + wFinal;
      const d2 = legCenter * 2 - wFinal;
      const w2 = wFinal / 2;
      

// ✅ Correct weight formula (as given)
const weight =
  7.45 *
  plate.stk *
  ((d1 * wFinal) - (wFinal * wFinal * 1.25)) /
  1_000_000;

// ✅ Correct area formula (as given)
const area_dm2 = (plate.stk * wFinal) / 100;


const packets = even(
  plate.stk / packetThickness
);

      yokePlates.push({
        itemNo: idx + 1,
        stk: plate.stk,
        w: wFinal,
        d1: d1,
        step: `+20,+10,0,-10,-20`,
        d2: d2,
        w2: w2,
        area: area_dm2.toFixed(1),
        packets: packets,
        weight: weight.toFixed(2)
      });
      
      const h1 = (windowHeight + wFinal);
      const h2 = windowHeight - wFinal;
      const sideArea = (wFinal* h1) / 1000;
const sideWeight = weight;
      
      sideLimbPlates.push({
        itemNo: idx + 1,
        stk: plate.stk,
        w: wFinal,
        h1: h1,
        h2: h2,
        step: `+20,+10,0,-10,-20`,
        packets: packets,
        weight: sideWeight.toFixed(2),
        area: area_dm2.toFixed(1)
      });
      
      const centerStk = Math.round(plate.stk / 2);
const centerPackets = even(
  centerStk / packetThickness
);
      const c = windowHeight + wFinal;
      const a = wFinal/ 2 + 10;
      const b = wFinal / 2 - 10;
      const centerArea = area_dm2 / 2;
      const centerWeight = weight / 2;
      
      centerLimbPlates.push({
        itemNo: idx + 1,
        stk: centerStk,
        w: wFinal,
        packets: centerPackets,
        c: c,
        step: `+20,+10,0,-10,-20`,
        a: a,
        b: b,
        weight: centerWeight.toFixed(2),
        area: centerArea.toFixed(1)
      });
    });


 const totalCoreWeight = [...yokePlates, ...sideLimbPlates, ...centerLimbPlates]
  .reduce((sum, p) => sum + parseFloat(p.weight), 0);

// -------- TOTALS FOR TABLES --------
const yokeTotals = {
  stk: yokePlates.reduce((s, p) => s + p.stk, 0),
  packets: yokePlates.reduce((s, p) => s + p.packets, 0),
  weight: yokePlates.reduce((s, p) => s + Number(p.weight), 0),
  area: yokePlates.reduce((s, p) => s + Number(p.area), 0),
};

const sideTotals = {
  stk: sideLimbPlates.reduce((s, p) => s + p.stk, 0),
  packets: sideLimbPlates.reduce((s, p) => s + p.packets, 0),
  weight: sideLimbPlates.reduce((s, p) => s + Number(p.weight), 0),
  area: sideLimbPlates.reduce((s, p) => s + Number(p.area), 0),
};

const centerTotals = {
  stk: centerLimbPlates.reduce((s, p) => s + p.stk, 0),
  packets: centerLimbPlates.reduce((s, p) => s + p.packets, 0),
  weight: centerLimbPlates.reduce((s, p) => s + Number(p.weight), 0),
  area: centerLimbPlates.reduce((s, p) => s + Number(p.area), 0),
};



const coreAreaFromCenter_dm2 =
  centerTotals.area;

const coreStackFromCenter =
  centerTotals.stk;

// Convert cm² → mm² for flux density formula
const coreArea_mm2 = coreAreaFromCenter_dm2 * 100;

// ✅ FINAL FLUX DENSITY (CORRECT)
const fluxDensity =
  (voltsPerTurn * 1_000_000) /
  (4.44 * frequency * coreArea_mm2);

 
// ✅ ACTUAL CORE LOSSES (based on cutting weight)
const actualCoreLosses = totalCoreWeight * 0.8;
    
    
    // Tank Design
    const tankInsideLength = priOuterDia + 400;
    const tankInsideWidth = legCenter * 2 + priOuterDia + 300;
    const tankInsideHeight = windowHeight + coreDiameter + 600;
    
    const sideClearanceLength = 150;
    const lvClearance = 100;
    const hvClearance = 150;
    const bottomClearance = 200;
    const topClearance = 300;
    
    const radiatorCC = 150;
    const radiatorWidth = 100;
    const radiatorFins = 20;
    const radiatorNos = 8;
    
    const insulationWeight = 560;
    const frameWeight = 1400;

// ✅ LV Winding Weight (kg)
const lvWindingWeight =
  secMeanLength *
  secondaryTurns *
  secConductorArea *
  secParallel *
  8.9 / 1_000_000;

// ✅ HV Winding Weight (kg)
const hvWindingWeight =
  priMeanLength *
  primaryTurns *
  priConductorArea *
  priParallel *
  8.9 / 1_000_000;


    // ✅ Core + Winding weight (using ACTUAL core weight)
const coreWindingWeight =
  totalCoreWeight +
  lvWindingWeight +
  hvWindingWeight;


    // ✅ Convert mm³ → m³
const tankVolume_m3 =
  (tankInsideLength *
   tankInsideWidth *
   tankInsideHeight) / 1_000_000_000;

// 80% oil filling
const oilVolume = tankVolume_m3 * 0.8;

// Transformer oil density ≈ 890 kg/m³
const oilWeight = oilVolume * 890;

    const tankSurfaceArea =
  2 * (
    (tankInsideLength * tankInsideHeight) +
    (tankInsideWidth * tankInsideHeight) +
    (tankInsideLength * tankInsideWidth)
  ) / 1_000_000; // mm² → m²

const tankWeight =
  tankSurfaceArea * 0.006 * 7850;

const radiatorWeight = radiatorNos * 100;
const totalWeight =
  insulationWeight +
  frameWeight +
  coreWindingWeight +
  tankWeight +
  radiatorWeight +
  oilWeight;

    return {
      sheet1: {
        voltsPerTurn: voltsPerTurn.toFixed(2),
        secondaryVoltage: Number(secondaryPhaseVoltage).toFixed(3),
        primaryVoltage: Number(primaryPhaseVoltage).toFixed(2),
        secondaryConnection: secondaryConnection,
        primaryConnection: primaryConnection,
        coreDiameter: coreDiameter.toFixed(0),
        secondaryPhaseCurrent: secondaryCurrent.toFixed(2),
        primaryPhaseCurrent: primaryCurrent.toFixed(2),
        windowHeight: windowHeight.toFixed(0),
        legCenter: legCenter.toFixed(0),
        secondaryTotalTurns: secondaryTurns,
        primaryTotalTurns: primaryTurns,
        primaryMaxTurns: Math.round(primaryTurns * 1.05),
        primaryNormalTurns: primaryTurns,
        primaryMinTurns: Math.round(primaryTurns * 0.95),
coreArea: coreAreaFromCenter_dm2.toFixed(2),
coreStack: coreStackFromCenter,
        fluxDensity: fluxDensity.toFixed(2),
        coreWeight: totalCoreWeight.toFixed(2),
        coreLosses: actualCoreLosses.toFixed(2),
lvWindingWeight: lvWindingWeight.toFixed(2),
hvWindingWeight: hvWindingWeight.toFixed(2),
        secondary: {
          conductorWidth: secWidth.toFixed(2),
          conductorThickness: secThickness.toFixed(2),
          noParallel: secParallelUsed,
          widthWiseParallel: secWidthParallel,
          radialWiseParallel: secRadialParallel,
          paperCovering: secPaperCovering,
          windingType: secWindingType,
          radial: secRadial.toFixed(2),
          meanDia: secMeanDia.toFixed(2),
          innerDia: secInnerDia.toFixed(2),
          outerDia: secOuterDia.toFixed(2),
          windingHeight: secWindingHeight.toFixed(2),
          resistance30: secResistance30.toFixed(4),
          resistance75: secResistance75.toFixed(4),
          i2r30: secI2R30.toFixed(3),
          i2r75: secI2R75.toFixed(3),
          leadLosses: secLeadLosses.toFixed(3),
          eddyLosses: secEddyLosses.toFixed(3),
          gradient: secGradient,
          currentDensity: secCurrentDensity.toFixed(2)
        },
        primary: {
          conductorWidth: priWidth.toFixed(2),
          conductorThickness: priThickness.toFixed(2),
          noParallel: priParallel,
          widthWiseParallel: priWidthParallel,
          radialWiseParallel: priRadialParallel,
          paperCovering: priPaperCovering,
          windingType: priWindingType,
          radial: priRadial.toFixed(2),
          meanDia: priMeanDia.toFixed(2),
          innerDia: priInnerDia.toFixed(2),
          outerDia: priOuterDia.toFixed(2),
          windingHeight: priWindingHeight.toFixed(2),
          resistance30: priResistance30.toFixed(4),
          resistance75: priResistance75.toFixed(4),
          i2r30: priI2R30.toFixed(3),
          i2r75: priI2R75.toFixed(3),
          leadLosses: priLeadLosses.toFixed(3),
          eddyLosses: priEddyLosses.toFixed(3),
          gradient: priGradient,
          currentDensity: priCurrentDensity.toFixed(2)
        },
        totalI2R75: totalI2R75.toFixed(3),
        totalStrayLosses: totalStrayLosses.toFixed(3),
        reactancePercent: reactancePercent.toFixed(2),
        resistancePercent: resistancePercent.toFixed(2),
        impedanceNormalTap: impedanceNormalTap.toFixed(2),
        priMaxTapRes30: priMaxTapRes30.toFixed(4),
        priMaxTapRes75: priMaxTapRes75.toFixed(4),
        priMaxTapI2R30: priMaxTapI2R30.toFixed(3),
        priMaxTapI2R75: priMaxTapI2R75.toFixed(3),
        impedanceMaxTap: impedanceMaxTap.toFixed(2),
        priMinTapRes30: priMinTapRes30.toFixed(4),
        priMinTapRes75: priMinTapRes75.toFixed(4),
        priMinTapI2R30: priMinTapI2R30.toFixed(3),
        priMinTapI2R75: priMinTapI2R75.toFixed(3),
        impedanceMinTap: impedanceMinTap.toFixed(2)
      },
      sheet2: {
  lvTurns: lvTurns,
  tapSteps: tapSteps,
  coreDiameter: coreDiameter.toFixed(0),
  windowHeight: windowHeight.toFixed(0),
  legCenter: legCenter.toFixed(0),
  laminationThickness: laminationThickness,
  fluxDensity: fluxDensity.toFixed(2),
  voltsPerTurn: voltsPerTurn.toFixed(2),

  yokePlates: yokePlates,
  sideLimbPlates: sideLimbPlates,
  centerLimbPlates: centerLimbPlates,

  // ✅ ADD THESE (MOST IMPORTANT)
  yokeTotals: yokeTotals,
  sideTotals: sideTotals,
  centerTotals: centerTotals,

  actualCoreWeight: totalCoreWeight.toFixed(2),
  actualCoreLosses: actualCoreLosses.toFixed(2),
},

      sheet3: {
  tankInsideLength: tankInsideLength.toFixed(0),
  tankInsideWidth: tankInsideWidth.toFixed(0),
  tankInsideHeight: tankInsideHeight.toFixed(0),

  sideClearanceLength,
  lvClearance,
  hvClearance,
  bottomClearance,
  topClearance,

  radiatorCC,
  radiatorWidth,
  radiatorFins,
  radiatorNos,

  insulationWeight,
  frameWeight,

  // ✅ CORRECT BREAKUP (FROM SHEET-1 & 2)
  coreWeight: totalCoreWeight.toFixed(2),
  lvWindingWeight: lvWindingWeight.toFixed(2),
  hvWindingWeight: hvWindingWeight.toFixed(2),

  coreWindingWeight: coreWindingWeight.toFixed(2),

  tankWeight: tankWeight.toFixed(2),
  radiatorWeight,
  oilWeight: oilWeight.toFixed(2),
  oilVolume: oilVolume.toFixed(2),

  totalWeight: totalWeight.toFixed(2)
}

    };
  }, [inputs]);






  const renderSheet1 = () => {
    const data = calculations.sheet1;
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Design Output Sheet - 1</h3>
          
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div className="space-y-3">
              {/* Voltage / Turn */}
<div className="flex justify-between py-2 border-b">
  <span className="font-medium">Voltage/Turn:</span>

  <span className=" text-right">
    {Number(data.voltsPerTurn).toFixed(2)} V
  </span>
</div>

{/* Core Diameter (NOW EDITABLE – SAME DESIGN AS SS) */}
<div className="flex justify-between py-2 border-b items-center">
  <span className="font-medium text-gray-700">Core Diameter:</span>
  <div className="flex items-center">
    <input
      type="number"
      step="any"
      /* Logic: If override exists, use it. Otherwise, use the calculated value from data */
      value={inputs.coreDiameterOverride !== null && inputs.coreDiameterOverride !== "" 
             ? inputs.coreDiameterOverride 
             : data.coreDiameter}
      onChange={(e) => handleInputChange('coreDiameterOverride', e.target.value)}
      /* Styling: Black and Bold */
      className="text-right text-black focus:ring-blue-400 outline-none"
    />
    <span className="ml-1 text-black">mm</span>
  </div>
</div>

{/* Window Height */}
<div className="flex justify-between py-2 border-b">
  <span className="font-medium">Window Height:</span>

<span>
  <input
  type="number"
  value={inputs.windowHeightOverride || data.windowHeight}
  onChange={(e) => handleInputChange('windowHeightOverride', e.target.value)}
  className="text-right text-black w-24 outline-none"
/>

  <span className="">mm</span>
</span>
</div>

{/* Leg Center */}
<div className="flex justify-between py-2 border-b">
  <span className="font-medium ">Leg Center:</span>

<span>
  <input
      type="number"
      /* Show the override if typed, otherwise show calculated data */
      value={inputs.legCenterOverride || calculations.sheet1.legCenter}
      onChange={(e) => handleInputChange('legCenterOverride', e.target.value)}
      className="text-right text-black outline-none w-24 bg-transparent"
    />

  <span className="">mm</span>
</span>
</div>

              <div className="flex justify-between py-2 border-b">
<span className="font-medium">Core Area :</span>
                <span>{data.coreArea} cm²</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Flux Density:</span>
                <span>{data.fluxDensity} T</span>
              </div>
              <div className="flex justify-between py-2 border-b">
  <span className="font-medium">Core Weight:</span>
  <span>{calculations.sheet2.actualCoreWeight} kg</span>
</div>

<div className="flex justify-between py-2 border-b">
  <span className="font-medium">Core Losses:</span>
  <span>{calculations.sheet2.actualCoreLosses} kW</span>
</div>

            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Secondary Voltage:</span>
                <span>{data.secondaryVoltage} kV</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Primary Voltage:</span>
                <span>{data.primaryVoltage} kV</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Secondary Connection:</span>
                <span>{data.secondaryConnection}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Primary Connection:</span>
                <span>{data.primaryConnection}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Reactance:</span>
                <span>{data.reactancePercent} %</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Resistance:</span>
                <span>{data.resistancePercent} %</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Impedance Normal Tap:</span>
                <span>{data.impedanceNormalTap} %</span>
              </div>
<div className="flex justify-between py-2 border-b">
  <span className="font-medium">Core Stack (Center Limb):</span>
  <span>{data.coreStack} mm</span>
</div>

            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="border-2 border-blue-200 rounded-lg p-4">
              <h4 className="font-bold text-lg text-blue-800 mb-4">Secondary Winding (LV)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b">
                  <span>Total Turns:</span>
		<span>
                  <input
  type="number"
  value={inputs.secondaryTurnsOverride || data.secondaryTotalTurns}
  onChange={(e) => handleInputChange('secondaryTurnsOverride', e.target.value)}
  className=" font-medium text-right text-black w-24 outline-none"
/>

<span className=" font-medium">Nos</span>
</span>

                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Phase Current:</span>
                  <span className="font-medium">{data.secondaryPhaseCurrent} A</span>
                </div>
                <div className="flex justify-between py-1 border-b">
  <span>Conductor Width (W):</span>
<span>
  <span className="font-medium text-right">
    {data.secondary.conductorWidth}
  </span>
  <span className="font-medium"> mm</span>
</span>
</div>

<div className="flex justify-between py-1 border-b">
  <span>Conductor Thickness (T):</span>
<span>
  <span className="font-medium text-right">
    {data.secondary.conductorThickness}
  </span>
  <span className="font-medium"> mm</span>
</span>
</div>

                <div className="flex justify-between py-1 border-b">
                  <span>No. Parallel Conductors:</span>
                  <span className="font-medium">{data.secondary.noParallel}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Width Wise Parallel:</span>
                  <span className="font-medium">{data.secondary.widthWiseParallel}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Radial Wise Parallel:</span>
                  <span className="font-medium">{data.secondary.radialWiseParallel}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Paper Covering:</span>
                  <span className="font-medium">{data.secondary.paperCovering} mm</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Winding Type:</span>
                  <span className="font-medium">{data.secondary.windingType}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Radial:</span>
                  <span className="font-medium">{data.secondary.radial} mm</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Mean Diameter:</span>
                  <span className="font-medium">{data.secondary.meanDia} mm</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Inner Diameter:</span>
                  <span className="font-medium">{data.secondary.innerDia} mm</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Outer Diameter:</span>
                  <span className="font-medium">{data.secondary.outerDia} mm</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Winding Height:</span>
                  <span className="font-medium">{data.secondary.windingHeight} mm</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Resistance @30°C:</span>
                  <span className="font-medium">{data.secondary.resistance30} Ω</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Resistance @75°C:</span>
                  <span className="font-medium">{data.secondary.resistance75} Ω</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>I²R @30°C:</span>
                  <span className="font-medium">{data.secondary.i2r30} kW</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>I²R @75°C:</span>
                  <span className="font-medium">{data.secondary.i2r75} kW</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Lead Losses:</span>
                  <span className="font-medium">{data.secondary.leadLosses} kW</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Eddy Losses:</span>
                  <span className="font-medium">{data.secondary.eddyLosses} kW</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Gradient:</span>
                  <span className="font-medium">{data.secondary.gradient} °C</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Current Density:</span>
                  <span className="font-medium">{data.secondary.currentDensity} A/mm²</span>
                </div>
              </div>
            </div>

            <div className="border-2 border-green-200 rounded-lg p-4">
              <h4 className="font-bold text-lg text-green-800 mb-4">Primary Winding (HV)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b">
                  <span>Total Turns (Max/Normal/Min):</span>
                  <span className="font-medium">{data.primaryMaxTurns}/{data.primaryTotalTurns}/{data.primaryMinTurns}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Phase Current:</span>
                  <span className="font-medium">{data.primaryPhaseCurrent} A</span>
                </div>
                <div className="flex justify-between py-1 border-b">
  <span>Conductor Width (W):</span>
  <span className="font-medium">
    {data.primary.conductorWidth} mm
  </span>
</div>
<div className="flex justify-between py-1 border-b">
  <span>Conductor Thickness (T):</span>
  <span className="font-medium">
    {data.primary.conductorThickness} mm
  </span>
</div>


                <div className="flex justify-between py-1 border-b">
                  <span>No. Parallel Conductors:</span>
                  <span className="font-medium">{data.primary.noParallel}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Width Wise Parallel:</span>
                  <span className="font-medium">{data.primary.widthWiseParallel}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Radial Wise Parallel:</span>
                  <span className="font-medium">{data.primary.radialWiseParallel}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Paper Covering:</span>
                  <span className="font-medium">{data.primary.paperCovering} mm</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Winding Type:</span>
                  <span className="font-medium">{data.primary.windingType}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Radial:</span>
                  <span className="font-medium">{data.primary.radial} mm</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Mean Diameter:</span>
                  <span className="font-medium">{data.primary.meanDia} mm</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Inner Diameter:</span>
                  <span className="font-medium">{data.primary.innerDia} mm</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Outer Diameter:</span>
                  <span className="font-medium">{data.primary.outerDia} mm</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Winding Height:</span>
                  <span className="font-medium">{data.primary.windingHeight} mm</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Resistance @30°C:</span>
                  <span className="font-medium">{data.primary.resistance30} Ω</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Resistance @75°C:</span>
                  <span className="font-medium">{data.primary.resistance75} Ω</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>I²R @30°C:</span>
                  <span className="font-medium">{data.primary.i2r30} kW</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>I²R @75°C:</span>
                  <span className="font-medium">{data.primary.i2r75} kW</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Lead Losses:</span>
                  <span className="font-medium">{data.primary.leadLosses} kW</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Eddy Losses:</span>
                  <span className="font-medium">{data.primary.eddyLosses} kW</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Gradient:</span>
                  <span className="font-medium">{data.primary.gradient} °C</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Current Density:</span>
                  <span className="font-medium">{data.primary.currentDensity} A/mm²</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <h5 className="font-bold mb-2">Total Losses</h5>
              <div className="flex justify-between py-1">
                <span>Total I²R @75°C:</span>
                <span className="font-medium">{data.totalI2R75} kW</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Total Stray Losses:</span>
                <span className="font-medium">{data.totalStrayLosses} kW</span>
              </div>
            </div>
            <div>
              <h5 className="font-bold mb-2">Tap Impedance</h5>
              <div className="flex justify-between py-1">
                <span>Maximum Tap:</span>
                <span className="font-medium">{data.impedanceMaxTap} %</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Normal Tap:</span>
                <span className="font-medium">{data.impedanceNormalTap} %</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Minimum Tap:</span>
                <span className="font-medium">{data.impedanceMinTap} %</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSheet2 = () => {
    const data = calculations.sheet2;
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Design Output Sheet - 2: Ratio Calculation & Core Cutting Schedule</h3>
          
          <div className="mb-6 grid grid-cols-6 gap-4 bg-blue-50 p-4 rounded">

            <div>
              <span className="text-sm text-gray-600">Core Diameter:</span>
              <div className="font-bold text-lg">{data.coreDiameter} mm</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Window Height:</span>
              <div className="font-bold text-lg">{data.windowHeight} mm</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Leg Center:</span>
              <div className="font-bold text-lg">{data.legCenter} mm</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">LV Turns:</span>
              <div className="font-bold text-lg">{data.lvTurns}</div>
            </div>
{/* Lamination Thickness (Editable) */}
<div>
  <span className="text-sm text-gray-600">
    Lamination Thickness
  </span>

  <select
    value={inputs.laminationThickness}
    onChange={(e) =>
      handleInputChange(
        'laminationThickness',
        Number(e.target.value)
      )
    }
    className="mt-1 w-full px-2 py-1 border rounded text-lg font-bold bg-white"
  >
    <option value={0.35}>0.35 mm</option>
    <option value={0.30}>0.30 mm</option>
    <option value={0.27}>0.27 mm</option>
    <option value={0.23}>0.23 mm</option>
  </select>
</div>

{/* Laminations per Packet (Editable) */}
<div>
  <span className="text-sm text-gray-600">
    Laminations / Packet
  </span>

  <select
    value={inputs.laminationsPerPacket}
    onChange={(e) =>
      handleInputChange(
        'laminationsPerPacket',
        Number(e.target.value)
      )
    }
    className="mt-1 w-full px-2 py-1 border rounded text-lg font-bold bg-white"
  >
    <option value={3}>3</option>
    <option value={5}>5</option>
    <option value={7}>7</option>
  </select>
</div>

          </div>

          <div className="mb-8">
            <h4 className="font-bold text-lg mb-3">Ratio Calculation - Tapping Steps</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Sr.No</th>
                    <th className="border p-2">Voltage (kV)</th>
                    <th className="border p-2">Clu. Ratio</th>
                    <th className="border p-2">Clu. Turns</th>
                    <th className="border p-2">Actual Turns</th>
                    <th className="border p-2">Turns Diff</th>
                    <th className="border p-2">% Error</th>
                    <th className="border p-2">D.T. Ratio</th>
                    <th className="border p-2">+10%</th>
                    <th className="border p-2">0%</th>
                    <th className="border p-2">-10%</th>
                  </tr>
                </thead>
                <tbody>
                  {data.tapSteps.map((step, idx) => (
  <tr 
    key={idx} 
    className={step.tapPercent === "0%" ? 'bg-blue-50 font-bold' : (idx % 2 === 0 ? 'bg-white' : 'bg-gray-50')}
  >
    <td className="border p-2 text-center">{step.srNo}</td>
    {/* Tap % dikhane ke liye ek extra cell add kar sakte hain */}
    <td className="border p-2 text-right">{step.voltage}</td>
    <td className="border p-2 text-right">{step.cluRatio}</td>
    <td className="border p-2 text-right">{step.cluTurns}</td>
    <td className="border p-2 text-right">{step.actualTurns}</td>
    <td className="border p-2 text-right">{step.turnsDiff}</td>
    <td className="border p-2 text-right">{step.error}</td>
    <td className="border p-2 text-right">{step.dTRatio}</td>
    <td className="border p-2 text-right">{step.plusTenPercent}</td>
    <td className="border p-2 text-right">{step.normal}</td>
    <td className="border p-2 text-right">{step.minusTenPercent}</td>
  </tr>
))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <h4 className="font-bold text-lg mb-3 text-green-700">Yoke Plates (Pairs Required)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="border p-2">Item</th>
                      <th className="border p-2">STK-1</th>
                      <th className="border p-2">W</th>
                      <th className="border p-2">D1</th>
                      <th className="border p-2">Step</th>
                      <th className="border p-2">D2</th>
                      <th className="border p-2">W/2</th>
                      <th className="border p-2">Packets</th>
                      <th className="border p-2">Weight (kg)</th>
<th className="border p-2">Area </th>
                    </tr>
                  </thead>
<tbody>
  {data.yokePlates.map((plate, idx) => (
    <tr key={idx}>
      <td className="border p-2 text-center">{plate.itemNo}</td>
      <td className="border p-2 text-center">{plate.stk}</td>
      <td className="border p-2 text-center">
  <input
    type="number"
    min={60}
    value={plate.w}
    onChange={(e) =>
      setWOverrides(prev => ({
        ...prev,
        [`plate-${idx}`]: Number(e.target.value)
      }))
    }
    className="w-20 text-center border-0 outline-none bg-transparent focus:border-b focus:border-green-500"
  />
</td>

      <td className="border p-2 text-center">{plate.d1}</td>
      <td className="border p-2 text-center text-xs">{plate.step}</td>
      <td className="border p-2 text-center">{plate.d2}</td>
      <td className="border p-2 text-center">{plate.w2}</td>
      <td className="border p-2 text-center">{plate.packets}</td>
      <td className="border p-2 text-right">{plate.weight}</td>
      <td className="border p-2 text-right">{plate.area}</td>
    </tr>
  ))}

  <tr className="bg-green-200 font-bold">
    <td className="border p-2 text-center">TOTAL</td>
    <td className="border p-2 text-center">{data.yokeTotals.stk}</td>
    <td className="border p-2" />
    <td className="border p-2" />
    <td className="border p-2" />
    <td className="border p-2" />
    <td className="border p-2" />
    <td className="border p-2 text-center">{data.yokeTotals.packets}</td>
    <td className="border p-2 text-right">{data.yokeTotals.weight.toFixed(2)}</td>
    <td className="border p-2 text-right">{data.yokeTotals.area.toFixed(1)}</td>
  </tr>
</tbody>
</table>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-3 text-blue-700">Side Limb Plates (Pairs Required)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="border p-2">Item</th>
                      <th className="border p-2">STK-2</th>
                      <th className="border p-2">W</th>
                      <th className="border p-2">H1</th>
                      <th className="border p-2">Step</th>
                      <th className="border p-2">H2</th>
                      <th className="border p-2">Packets</th>
                      <th className="border p-2">Weight (kg)</th>
                      <th className="border p-2">Area </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sideLimbPlates.map((plate, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border p-2 text-center">{plate.itemNo}</td>
                        <td className="border p-2 text-center">{plate.stk}</td>
                        <td className="border p-2 text-center">
  <input
    type="number"
    min={60}
    value={plate.w}
    onChange={(e) =>
      setWOverrides(prev => ({
        ...prev,
        [`plate-${idx}`]: Number(e.target.value)
      }))
    }
    className="w-20 text-center border-0 outline-none bg-transparent focus:border-b focus:border-blue-500"
  />
</td>
                        <td className="border p-2 text-center">{plate.h1}</td>
                        <td className="border p-2 text-center text-xs">{plate.step}</td>
                        <td className="border p-2 text-center">{plate.h2}</td>
                        <td className="border p-2 text-center">{plate.packets}</td>
                        <td className="border p-2 text-right font-medium">{plate.weight}</td>
                        <td className="border p-2 text-right">{plate.area}</td>
                      </tr>
			

                    ))}
<tr className="bg-blue-200 font-bold">
  <td className="border p-2 text-center">TOTAL</td>
  <td className="border p-2 text-center">{data.sideTotals.stk}</td>
  <td className="border p-2"></td>
  <td className="border p-2"></td>
  <td className="border p-2"></td>
  <td className="border p-2"></td>
  <td className="border p-2 text-center">{data.sideTotals.packets}</td>
  <td className="border p-2 text-right">{data.sideTotals.weight.toFixed(2)}</td>
  <td className="border p-2 text-right">{data.sideTotals.area.toFixed(1)}</td>
</tr>

                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-3 text-purple-700">Center Limb Plates</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-purple-100">
                    <tr>
                      <th className="border p-2">Item</th>
                      <th className="border p-2">STK-3</th>
                      <th className="border p-2">W</th>
                      <th className="border p-2">Packets</th>
                      <th className="border p-2">C</th>
                      <th className="border p-2">Step</th>
                      <th className="border p-2">A</th>
                      <th className="border p-2">B</th>
                      <th className="border p-2">Weight (kg)</th>
                      <th className="border p-2">Area </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.centerLimbPlates.map((plate, idx) => (
  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
    <td className="border p-2 text-center">{plate.itemNo}</td>
    <td className="border p-2 text-center">{plate.stk}</td>
<td className="border p-2 text-center">
  <input
    type="number"
    min={60}
    value={plate.w}
    onChange={(e) =>
      setWOverrides(prev => ({
        ...prev,
        [`plate-${idx}`]: Number(e.target.value)
      }))
    }
    className="w-20 text-center border-0 outline-none bg-transparent focus:border-b focus:border-purple-500"

  />
</td>
    <td className="border p-2 text-center">{plate.packets}</td>
    <td className="border p-2 text-center">{plate.c}</td>
    <td className="border p-2 text-center">{plate.step}</td>
    <td className="border p-2 text-center">{plate.a}</td>
    <td className="border p-2 text-center">{plate.b}</td>
    <td className="border p-2 text-right">{plate.weight}</td>
    <td className="border p-2 text-right">{plate.area}</td>
  </tr>
))}

  <tr className="bg-purple-200 font-bold">
  <td className="border p-2 text-center">TOTAL</td>
  <td className="border p-2 text-center">{data.centerTotals.stk}</td>
  <td className="border p-2"></td>
  <td className="border p-2 text-center">{data.centerTotals.packets}</td>
  <td className="border p-2"></td>
  <td className="border p-2"></td>
  <td className="border p-2"></td>
  <td className="border p-2"></td>
  <td className="border p-2 text-right">{data.centerTotals.weight.toFixed(2)}</td>
  <td className="border p-2 text-right">{data.centerTotals.area.toFixed(1)}</td>
</tr>

                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
            <h4 className="font-bold text-xl mb-2">Total Core Weight</h4>
            <div className="text-3xl font-bold text-blue-700">{data.actualCoreWeight} kg</div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <h5 className="font-bold mb-2">Notes:</h5>
            <ul className="list-disc list-inside space-y-1">
              <li>±20, ±10, 0 steps mentioned for calculation of lengths of other laminations in a 5-lamination packet</li>
              <li>Two holes of 26 mm punch in side limb, center limb and yoke at specified distances from center</li>
              <li>D1 = Leg Center × 2 + W AND D2 = Leg Center × 2 - W (YOKE PLATES)</li>
              <li>H1 = C + W AND H2 = C - W (SIDE LIMB)</li>
              <li>C = Window Height + Max Yoke Size (i.e 'W')</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderSheet3 = () => {
    const data = calculations.sheet3;
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Design Output Sheet - 3: Tank & Mechanical Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-blue-200 rounded-lg p-6">
              <h4 className="font-bold text-lg text-blue-800 mb-4">Tank Inside Details</h4>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Length:</span>
                    <span className="text-2xl font-bold">{data.tankInsideLength} mm</span>
                  </div>
                  <div className="text-sm text-gray-600">Side Clearance: {data.sideClearanceLength} mm</div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Width:</span>
                    <span className="text-2xl font-bold">{data.tankInsideWidth} mm</span>
                  </div>
                  <div className="text-sm text-gray-600">LV Clearance: {data.lvClearance} mm | HV Clearance: {data.hvClearance} mm</div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Height:</span>
                    <span className="text-2xl font-bold">{data.tankInsideHeight} mm</span>
                  </div>
                  <div className="text-sm text-gray-600">Bottom Clearance: {data.bottomClearance} mm | Top Clearance: {data.topClearance} mm</div>
                </div>
              </div>
            </div>

            <div className="border-2 border-green-200 rounded-lg p-6">
              <h4 className="font-bold text-lg text-green-800 mb-4">Radiator Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span>Center to Center:</span>
                  <span className="font-medium">{data.radiatorCC} mm</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Width:</span>
                  <span className="font-medium">{data.radiatorWidth} mm</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Number of Fins:</span>
                  <span className="font-medium">{data.radiatorFins}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Number of Radiators:</span>
                  <span className="font-medium">{data.radiatorNos}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-2 border-purple-200 rounded-lg p-6">
            <h4 className="font-bold text-lg text-purple-800 mb-4">Weight Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b bg-gray-50 px-3 rounded">
                  <span>Insulation:</span>
                  <span className="font-bold">{data.insulationWeight} kg</span>
                </div>
                <div className="flex justify-between py-2 border-b bg-gray-50 px-3 rounded">
                  <span>Frame:</span>
                  <span className="font-bold">{data.frameWeight} kg</span>
                </div>
                <div className="flex justify-between py-2 border-b bg-gray-50 px-3 rounded">
  <span>Core Weight:</span>
  <span className="font-bold">{data.coreWeight} kg</span>
</div>

<div className="flex justify-between py-2 border-b bg-gray-50 px-3 rounded">
  <span>LV Winding:</span>
  <span className="font-bold">{data.lvWindingWeight} kg</span>
</div>

<div className="flex justify-between py-2 border-b bg-gray-50 px-3 rounded">
  <span>HV Winding:</span>
  <span className="font-bold">{data.hvWindingWeight} kg</span>
</div>

<div className="flex justify-between py-2 border-b bg-gray-50 px-3 rounded">
  <span>Core + Winding:</span>
  <span className="font-bold">{data.coreWindingWeight} kg</span>
</div>

                <div className="flex justify-between py-2 border-b bg-gray-50 px-3 rounded">
                  <span>Tank & Fitting:</span>
                  <span className="font-bold">{data.tankWeight} kg</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b bg-gray-50 px-3 rounded">
                  <span>Radiator:</span>
                  <span className="font-bold">{data.radiatorWeight} kg</span>
                </div>
                <div className="flex justify-between py-2 border-b bg-gray-50 px-3 rounded">
                  <span>Oil:</span>
                  <span className="font-bold">{data.oilWeight} kg</span>
                </div>
                <div className="flex justify-between py-2 border-b bg-gray-50 px-3 rounded">
                  <span>Oil Volume:</span>
                  <span className="font-bold">{data.oilVolume} Liters</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-lg text-center">
              <div className="text-sm text-gray-600 mb-2">TOTAL WEIGHT</div>
              <div className="text-4xl font-bold text-purple-700">{data.totalWeight} kg</div>
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-300 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Package className="w-6 h-6 text-yellow-600 mt-1" />
              <div className="text-sm">
                <div className="font-bold mb-1">OLTC (On-Load Tap Changer)</div>
                <div className="text-gray-700">OLTC weight to be added separately based on specific model and rating requirements.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

const renderAnalysis = () => {
  const data = calculations.sheet1;

  const lossData = [
    { name: 'Core Loss', value: Number(calculations.sheet2.actualCoreLosses) },
    { name: 'Copper Loss', value: Number(data.totalI2R75) },
    { name: 'Stray Loss', value: Number(data.totalStrayLosses) }
  ];

  const coreData = [
    { name: 'Core Area (cm²)', value: Number(data.coreArea) },
    { name: 'Flux Density (T)', value: Number(data.fluxDensity) }
  ];

const aiPayload = {
  ratingMVA: inputs.rating,
  frequency: inputs.frequency,
  voltages: {
    primary: inputs.primaryVoltage,
    secondary: inputs.secondaryVoltage
  },
  core: {
  area_cm2: calculations.sheet1.coreArea,
  fluxDensity: calculations.sheet1.fluxDensity,
  coreLosses: calculations.sheet2.actualCoreLosses,
  coreWeight: calculations.sheet2.actualCoreWeight
},
  winding: {
    lv: calculations.sheet1.secondary,
    hv: calculations.sheet1.primary
  },
  losses: {
    copper: calculations.sheet1.totalI2R75,
    stray: calculations.sheet1.totalStrayLosses
  },
  cooling: inputs.coolingType
};

const analyzeWithAI = async () => {
  try {
    setAiLoading(true);
    setAiSuggestions([]);

    const response = await fetch('http://localhost:5000/analyze-transformer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aiPayload)
    });

    const result = await response.json();
    setAiSuggestions(result.suggestions || []);
  } catch (e) {
    console.error(e);
  } finally {
    setAiLoading(false);
  }
};



  return (
    <div className="space-y-6">

      {/* GRAPHS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* LOSS PIE CHART */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-4">Loss Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={lossData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                <Cell fill="#ef4444" />
                <Cell fill="#3b82f6" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* CORE CHECK */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-4">Core Design Check</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={coreData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

     <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
  <div className="flex justify-between items-center mb-6">
    <div>
      <h3 className="text-2xl font-bold">TELAWNE AI</h3>
      <p className="text-sm opacity-80">Cost–Performance Optimizer</p>
    </div>

    <button
      onClick={analyzeWithAI}
      disabled={aiLoading}
      className="bg-green-400 text-blue-900 font-bold px-6 py-2 rounded-xl hover:bg-green-300"
    >
      {aiLoading ? "Analyzing..." : "Optimize Cost"}
    </button>
  </div>

  {/* AI RESULTS */}
  {aiSuggestions.length === 0 && !aiLoading && (
    <div className="border border-dashed border-blue-300 rounded-xl p-8 text-center opacity-70">
      EXECUTE ANALYSIS TO UNLOCK OPTIMIZATION
    </div>
  )}

  <div className="space-y-3">
    {aiSuggestions.map((s, idx) => (
      <div
        key={idx}
        className="flex items-center justify-between bg-white text-blue-900 rounded-xl px-4 py-3"
      >
        <div>
          <div className="font-semibold">{s.label}</div>
          <div className="text-xs text-gray-600">
            {s.current} → <b>{s.suggested}</b>
          </div>
        </div>

        <button
          onClick={() =>
            handleInputChange(s.field, s.suggested)
          }
          className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700"
        >
          Apply
        </button>
      </div>
    ))}
  </div>
</div>


    </div>
  );
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Zap className="text-blue-600" />
                Transformer Design Software
              </h1>
              <p className="text-gray-600 mt-2">Comprehensive Design Calculator with Detailed Output Sheets</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Sales Order: {inputs.salesOrderNumber}</div>
              <div className="text-sm text-gray-600">Customer: {inputs.customerName}</div>
              <div className="text-sm text-gray-600">Date: {inputs.date}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
	{['design', 'sheet1', 'sheet2', 'sheet3', 'analysis'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab === 'design' && <Settings className="w-4 h-4" />}
                {tab === 'sheet1' && <FileText className="w-4 h-4" />}
                {tab === 'sheet2' && <Layers className="w-4 h-4" />}
                {tab === 'sheet3' && <Package className="w-4 h-4" />}
		{tab === 'analysis' && <Zap className="w-4 h-4" />}
                {tab === 'design'
    ? 'Design Inputs'
    : tab === 'sheet1'
    ? 'Output Sheet 1'
    : tab === 'sheet2'
    ? 'Output Sheet 2'
    : tab === 'sheet3'
    ? 'Output Sheet 3'
    : 'Design Insights (AI)'}

              </button>
            ))}
          </div>
        </div>





{activeTab === 'design' && (
  <div className="space-y-6">

    {/* BASIC INFORMATION */}
    <div className="bg-white border-l-4 border-blue-600 rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <h3 className="text-lg font-bold text-blue-700 mb-4">Basic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InputField label="Date" field="date" type="date" value={inputs.date} onChange={handleInputChange} />
        <InputField label="Sales Order Number" field="salesOrderNumber" value={inputs.salesOrderNumber} onChange={handleInputChange} />
        <InputField label="Customer Name" field="customerName" value={inputs.customerName} onChange={handleInputChange} />
        <InputField label="Standard" field="standard" value={inputs.standard} onChange={handleInputChange} />
      </div>
    </div>

    {/* ELECTRICAL SPECIFICATIONS */}
    <div className="bg-white border-l-4 border-green-600 rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <h3 className="text-lg font-bold text-green-700 mb-4">Electrical Specifications</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InputField label="Rating" field="rating" type="number" unit="MVA" value={inputs.rating} onChange={handleInputChange} />
        <InputField label="Primary Voltage" field="primaryVoltage" type="number" unit="kV" value={inputs.primaryVoltage} onChange={handleInputChange} />
        <InputField label="Secondary Voltage" field="secondaryVoltage" type="number" unit="kV" value={inputs.secondaryVoltage} onChange={handleInputChange} />
        <InputField label="Frequency" field="frequency" options={[50, 60]} unit="Hz" value={inputs.frequency} onChange={handleInputChange} />
      </div>
    </div>

    {/* CONNECTION DETAILS */}
    <div className="bg-white border-l-4 border-purple-600 rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <h3 className="text-lg font-bold text-purple-700 mb-4">Connection Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InputField 
  label="Primary Connection" 
  field="primaryConnection" 
  value={inputs.primaryConnection} 
  onChange={handleInputChange}
className="bg-gray-50"
  readOnly={true}  
/>

<InputField 
  label="Secondary Connection" 
  field="secondaryConnection" 
  value={inputs.secondaryConnection} 
  onChange={handleInputChange}
className="bg-gray-50"
  readOnly={true} 
/>

        <InputField label="Vector Group" field="vectorGroup" options={["Dyn11", "Dyn5", "Yyn0", "Yyn6", "YNyn0", "Yd1", "Yd11", "Dd0", "Dd6", "Zyn11"]} value={inputs.vectorGroup} onChange={handleInputChange} />
        <InputField label="Winding Material" field="windingMaterial" options={["Copper", "Aluminium"]} value={inputs.windingMaterial} onChange={handleInputChange} />
      </div>
    </div>

    {/* TAPPING CONFIGURATION */}
    <div className="bg-white border-l-4 border-orange-600 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-orange-700 mb-4">Tapping Configuration</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InputField label="+Ve Tapping" field="positiveTapping" type="number" unit="%" value={inputs.positiveTapping} onChange={handleInputChange} />
        <InputField label="-Ve Tapping" field="negativeTapping" type="number" unit="%" value={inputs.negativeTapping} onChange={handleInputChange} />
        <InputField label="Step Size" field="tappingStepSize" type="number" unit="%" value={inputs.tappingStepSize} onChange={handleInputChange} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of Steps</label>
          <input
            type="number"
            value={autoNoOfSteps}
            onChange={(e) => handleInputChange("noOfSteps", Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
          />
        </div>
      </div>
    </div>

    {/* GUARANTEED PARAMETERS */}
    <div className="bg-white border-l-4 border-red-600 rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <h3 className="text-lg font-bold text-red-700 mb-4">Guaranteed Parameters</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InputField label="No-Load Losses" field="guaranteedNoLoadLosses" type="number" unit="kW" value={inputs.guaranteedNoLoadLosses} onChange={handleInputChange} />
        <InputField label="Full-Load Losses" field="guaranteedFullLoadLosses" type="number" unit="kW" value={inputs.guaranteedFullLoadLosses} onChange={handleInputChange} />
        <InputField label="Impedance" field="guaranteedImpedance" type="number" unit="%" value={inputs.guaranteedImpedance} onChange={handleInputChange} />
      </div>
<div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
  <div className="bg-gray-50 border rounded-lg p-4 text-center">
    <p className="text-gray-500">No-Load Loss Max</p>
    <p className="text-lg font-semibold text-gray-800">
      {noLoadMax} kW
    </p>
  </div>

  <div className="bg-gray-50 border rounded-lg p-4 text-center">
    <p className="text-gray-500">Full-Load Loss Max</p>
    <p className="text-lg font-semibold text-gray-800">
      {fullLoadMax} kW
    </p>
  </div>

  <div className="bg-gray-50 border rounded-lg p-4 text-center">
    <p className="text-gray-500">Impedance Range</p>
    <p className="text-lg font-semibold text-gray-800">
      {impedanceMin}% – {impedanceMax}%
    </p>
  </div>
</div>

    </div>

    {/* TEMPERATURE SPECIFICATIONS */}
<div className="bg-white border-l-4 border-cyan-600 rounded-lg shadow-md p-6 hover:shadow-lg transition">
  <h3 className="text-lg font-bold text-cyan-700 mb-4">
    Core Lamination Configuration
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

    <InputField
      label="Lamination Thickness"
      field="laminationThickness"
      options={[0.35, 0.30, 0.27, 0.23]}
      unit="mm"
      value={inputs.laminationThickness}
      onChange={handleInputChange}
    />

    <InputField
      label="Laminations per Packet"
      field="laminationsPerPacket"
      options={[3, 5, 7]}
      value={inputs.laminationsPerPacket}
      onChange={handleInputChange}
    />

  </div>
</div>

    <div className="bg-white border-l-4 border-teal-600 rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <h3 className="text-lg font-bold text-teal-700 mb-4">Temperature Specifications</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InputField
  label="Design Ambient Temp"
  field="designAmbientTemp"
  options={[40, 50]}
  unit="°C"
  value={inputs.designAmbientTemp}
  onChange={handleInputChange}
/>
        <InputField label="Oil Temp Rise" field="guaranteedOilTempRise" type="number" unit="°C" value={inputs.guaranteedOilTempRise} onChange={handleInputChange} />
        <InputField label="Winding Temp Rise" field="guaranteedWindingTempRise" type="number" unit="°C" value={inputs.guaranteedWindingTempRise} onChange={handleInputChange} />
        <InputField
  label="Cooling Type"
  field="coolingType"
  options={["ONAN", "ONAF", "OFAF", "ODAF"]}
  value={inputs.coolingType}
  onChange={handleInputChange}
/>

      </div>
    </div>
  </div>
)}

        {activeTab === 'sheet1' && renderSheet1()}
        {activeTab === 'sheet2' && renderSheet2()}
        {activeTab === 'sheet3' && renderSheet3()}

{activeTab === 'analysis' && renderAnalysis()}

	
        {activeTab !== 'design' && (
          <div className="flex justify-end mt-6">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md">
              <Download className="w-5 h-5" />
              Export {activeTab === 'sheet1' ? 'Sheet 1' : activeTab === 'sheet2' ? 'Sheet 2' : 'Sheet 3'} to PDF
            </button>
          </div>
        )}
      </div>		
    </div>
  );
};

export default TransformerDesignSoftware;