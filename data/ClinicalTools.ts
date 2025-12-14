
import { format, addDays, subMonths, addYears, differenceInDays } from 'date-fns';

export type CalcCategoryId = "dosage" | "infusion" | "fluids" | "hemodynamics" | "labs" | "conversions" | "maternal_child";

export type CalcId =
    | "universalDosage"
    | "universalIV"
    | "parkland"
    | "map"
    | "anc"
    | "unitConverter"
    | "gcs" 
    | "apgar"
    | "pediaDose"
    | "naegele";

export type FieldType = "number" | "select" | "date";

export interface CalcField {
    key: string;
    label: string;
    type: FieldType;
    unit?: string;
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
    options?: { label: string; value: string }[];
    unitOptions?: string[]; // For selectable units
    defaultUnit?: string;
    showIf?: { key: string; value: string | string[] };
}

export interface CalcResult {
    primary: { label: string; value: string };
    secondary?: { label: string; value: string }[];
    notes?: string[];
    equation?: string; // The solved equation string
}

export interface CalculatorDef {
    id: CalcId;
    category: CalcCategoryId;
    title: string;
    subtitle: string;
    badge?: string;
    iconName: "pill" | "droplet" | "flame" | "activity" | "flask" | "refresh" | "baby" | "calendar";
    fields: CalcField[];
    staticEquation: string; // The formula shown before calculation
    compute: (inputs: Record<string, string>) => CalcResult | null;
}

// --- HELPERS ---
const toNum = (v: string | undefined): number | null => {
    if (!v || v.trim() === '') return null;
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
};

const fmt = (n: number, d = 2) => n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: d });

// --- CONVERSION FACTORS ---
const CONVERSION_FACTORS: Record<string, number> = {
    // Volume (Base: mL)
    L: 1000,
    mL: 1,
    cc: 1,
    oz: 29.5735,
    tbsp: 14.7868,
    tsp: 4.92892,
    
    // Weight (Base: g)
    kg: 1000,
    g: 1,
    mg: 0.001,
    mcg: 0.000001,
    lb: 453.592,
    
    // Length (Base: m)
    m: 1,
    cm: 0.01,
    mm: 0.001,
    in: 0.0254,
    ft: 0.3048
};

// --- DEFINITIONS ---

export const calculatorCategories: { id: CalcCategoryId; label: string }[] = [
    { id: "dosage", label: "Dosage" },
    { id: "infusion", label: "Infusion" },
    { id: "maternal_child", label: "OB / Peds" },
    { id: "fluids", label: "Fluids" },
    { id: "hemodynamics", label: "Hemodynamics" },
    { id: "labs", label: "Labs" },
    { id: "conversions", label: "Converter" },
];

export const calculators: CalculatorDef[] = [
    {
        id: "universalDosage",
        category: "dosage",
        title: "Dosage Calc",
        subtitle: "Universal Formula (D/H x Q)",
        badge: "Core",
        iconName: "pill",
        staticEquation: "D ÷ H × Q = X",
        fields: [
            // Max increased to 10M to allow for Units (e.g. Penicillin)
            { key: "desired", label: "Desired Dose", type: "number", min: 0, max: 10000000, step: 0.01, placeholder: "500", unitOptions: ["mg", "g", "mcg", "units"], defaultUnit: "mg" },
            { key: "have", label: "Stock Strength", type: "number", min: 0, max: 10000000, step: 0.01, placeholder: "250", unitOptions: ["mg", "g", "mcg", "units"], defaultUnit: "mg" },
            { key: "quantity", label: "Stock Volume", type: "number", min: 0, max: 5000, step: 0.1, placeholder: "5", unitOptions: ["mL", "tab", "cap"], defaultUnit: "mL" },
        ],
        compute: (inputs) => {
            const d = toNum(inputs.desired);
            const h = toNum(inputs.have);
            const q = toNum(inputs.quantity);
            const dUnit = inputs.desired_unit || 'mg';
            const hUnit = inputs.have_unit || 'mg';
            const qUnit = inputs.quantity_unit || 'mL';

            if (d === null || h === null || q === null || h === 0) return null;

            // Simple unit normalization (basic implementation)
            let dNorm = d;
            let hNorm = h;

            // Convert to mg base if needed
            if (dUnit === 'g') dNorm = d * 1000;
            if (dUnit === 'mcg') dNorm = d / 1000;
            
            if (hUnit === 'g') hNorm = h * 1000;
            if (hUnit === 'mcg') hNorm = h / 1000;

            const result = (dNorm / hNorm) * q;

            return {
                primary: { label: "Administer", value: `${fmt(result)} ${qUnit}` },
                equation: `(${fmt(dNorm)} ÷ ${fmt(hNorm)}) × ${fmt(q)} = ${fmt(result)}`,
                notes: dUnit !== hUnit ? [`Note: Units converted to match base (${dUnit} → ${hUnit})`] : undefined
            };
        }
    },
    {
        id: "universalIV",
        category: "infusion",
        title: "IV Flow Master",
        subtitle: "Pumps, Drips, Time & Volume",
        iconName: "droplet",
        staticEquation: "Select Calculation Mode",
        fields: [
            { 
                key: "mode", 
                label: "Solve For...", 
                type: "select", 
                options: [
                    { label: "Pump Rate (mL/hr)", value: "pump" },
                    { label: "Drip Rate (gtt/min)", value: "drip" },
                    { label: "Infusion Time", value: "time" },
                    { label: "Total Volume", value: "vol" }
                ]
            },
            
            // Vol is needed for Pump, Drip, Time
            { key: "vol", label: "Total Volume", type: "number", min: 0, max: 10000, step: 1, placeholder: "1000", unit: "mL", showIf: { key: "mode", value: ["pump", "drip", "time"] } },
            
            // Time is needed for Pump, Drip, Vol
            { key: "time", label: "Duration", type: "number", min: 0, max: 100, step: 0.25, placeholder: "8", unitOptions: ["hr", "min"], defaultUnit: "hr", showIf: { key: "mode", value: ["pump", "drip", "vol"] } },
            
            // Rate (mL/hr) is needed for Time, Vol
            { key: "rate", label: "Pump Rate", type: "number", min: 0, max: 2000, step: 0.1, placeholder: "125", unit: "mL/hr", showIf: { key: "mode", value: ["time", "vol"] } },

            // Drop Factor needed ONLY for Drip
            { key: "df", label: "Drop Factor", type: "select", options: [
                { label: "10 gtt/mL (Macro)", value: "10" },
                { label: "15 gtt/mL (Macro)", value: "15" },
                { label: "20 gtt/mL (Macro)", value: "20" },
                { label: "60 gtt/mL (Micro)", value: "60" },
            ], showIf: { key: "mode", value: "drip" } }
        ],
        compute: (inputs) => {
            const mode = inputs.mode || 'pump';
            const v = toNum(inputs.vol);
            const t = toNum(inputs.time);
            const r = toNum(inputs.rate);
            const df = toNum(inputs.df) || 15;
            const tUnit = inputs.time_unit || 'hr';

            // PUMP RATE (mL/hr)
            if (mode === 'pump') {
                if (v === null || t === null || t === 0) return null;
                const hrs = tUnit === 'hr' ? t : t / 60;
                const result = v / hrs;
                return {
                    primary: { label: "Pump Rate", value: `${fmt(result, 1)} mL/hr` },
                    equation: `${v} mL ÷ ${fmt(hrs, 2)} hr = ${fmt(result, 1)}`,
                    notes: ["Set IV Pump to this rate"]
                };
            }

            // DRIP RATE (gtt/min)
            if (mode === 'drip') {
                if (v === null || t === null || t === 0) return null;
                const mins = tUnit === 'hr' ? t * 60 : t;
                const result = (v * df) / mins;
                return {
                    primary: { label: "Drip Rate", value: `${Math.round(result)} gtt/min` },
                    secondary: [{ label: "Exact", value: `${fmt(result, 2)}` }],
                    equation: `(${v} mL × ${df} gtt) ÷ ${mins} min = ${fmt(result)}`,
                    notes: ["Count drops for 1 full minute"]
                };
            }

            // TIME
            if (mode === 'time') {
                if (v === null || r === null || r === 0) return null;
                const totalHrs = v / r;
                const h = Math.floor(totalHrs);
                const m = Math.round((totalHrs - h) * 60);
                return {
                    primary: { label: "Duration", value: `${h}h ${m}m` },
                    equation: `${v} mL ÷ ${r} mL/hr = ${fmt(totalHrs, 2)} hr`
                };
            }

            // VOLUME
            if (mode === 'vol') {
                if (r === null || t === null) return null;
                const hrs = tUnit === 'hr' ? t : t / 60;
                const result = r * hrs;
                return {
                    primary: { label: "Total Volume", value: `${fmt(result, 0)} mL` },
                    equation: `${r} mL/hr × ${fmt(hrs, 2)} hr = ${fmt(result)}`
                };
            }

            return null;
        }
    },
    {
        id: "pediaDose",
        category: "maternal_child",
        title: "Pedia Dosage",
        subtitle: "Weight-Based Calculation",
        badge: "Peds",
        iconName: "baby",
        staticEquation: "Wt(kg) × Dose(mg/kg) = Total",
        fields: [
            { key: "weight", label: "Weight", type: "number", min: 0, max: 200, step: 0.01, placeholder: "10", unitOptions: ["kg", "lb"], defaultUnit: "kg" },
            { key: "dose", label: "Rec. Dose", type: "number", min: 0, max: 5000, step: 0.01, placeholder: "15", unit: "mg/kg" },
            { key: "conc", label: "Stock Strength", type: "number", min: 0, max: 10000, step: 0.01, placeholder: "100", unit: "mg/mL" }
        ],
        compute: (inputs) => {
            const w = toNum(inputs.weight);
            const d = toNum(inputs.dose);
            const c = toNum(inputs.conc);
            const wUnit = inputs.weight_unit || 'kg';

            if (w === null || d === null) return null;

            // Convert lb to kg if needed
            const weightKg = wUnit === 'lb' ? w / 2.2 : w;
            const totalMg = weightKg * d;

            const results = {
                primary: { label: "Total Dose", value: `${fmt(totalMg, 2)} mg` },
                secondary: [{ label: "Patient Wt", value: `${fmt(weightKg, 2)} kg` }],
                equation: `${fmt(weightKg, 2)} kg × ${d} mg/kg = ${fmt(totalMg, 2)} mg`,
                notes: [] as string[]
            };

            // If concentration provided, calculate mL
            if (c !== null && c > 0) {
                const ml = totalMg / c;
                results.secondary?.push({ label: "Volume", value: `${fmt(ml, 2)} mL` });
                results.notes?.push(`Give ${fmt(ml, 2)} mL of ${c} mg/mL stock`);
            }

            return results;
        }
    },
    {
        id: "naegele",
        category: "maternal_child",
        title: "EDD Calculator",
        subtitle: "Naegele's Rule + AOG",
        iconName: "calendar",
        staticEquation: "LMP + 1y - 3m + 7d",
        fields: [
            { key: "lmp", label: "Last Menstrual Period", type: "date" }
        ],
        compute: (inputs) => {
            if (!inputs.lmp) return null;
            const lmp = new Date(inputs.lmp);
            if (isNaN(lmp.getTime())) return null;

            // Naegele's Rule
            // Standard: Add 1 year, subtract 3 months, add 7 days
            const edd = addDays(subMonths(addYears(lmp, 1), 3), 7);
            
            // Calculate AOG (Age of Gestation)
            const today = new Date();
            const daysDiff = differenceInDays(today, lmp);
            const weeks = Math.floor(daysDiff / 7);
            const days = daysDiff % 7;

            // Trimester
            let trimester = "1st Trimester";
            if (weeks >= 13) trimester = "2nd Trimester";
            if (weeks >= 27) trimester = "3rd Trimester";

            return {
                primary: { label: "Est. Due Date", value: format(edd, 'MMM dd, yyyy') },
                secondary: [
                    { label: "AOG (Today)", value: `${weeks}w ${days}d` },
                    { label: "Phase", value: trimester }
                ],
                equation: `${format(lmp, 'MM/dd')} - 3m + 7d + 1y`,
                notes: [`Based on LMP: ${format(lmp, 'MMM dd, yyyy')}`]
            };
        }
    },
    {
        id: "parkland",
        category: "fluids",
        title: "Parkland Formula",
        subtitle: "Burn Resuscitation 24h",
        iconName: "flame",
        staticEquation: "4mL × kg × %TBSA",
        fields: [
            { key: "kg", label: "Weight", type: "number", min: 0, max: 500, step: 0.1, placeholder: "70", unit: "kg" },
            { key: "tbsa", label: "Burn Area", type: "number", min: 0, max: 100, step: 0.5, placeholder: "25", unit: "%TBSA" },
        ],
        compute: (inputs) => {
            const kg = toNum(inputs.kg);
            const tbsa = toNum(inputs.tbsa);
            if (kg === null || tbsa === null) return null;

            const total = 4 * kg * tbsa;
            return {
                primary: { label: "24h Total", value: `${fmt(total, 0)} mL` },
                secondary: [
                    { label: "1st 8 Hours", value: `${fmt(total/2, 0)} mL` },
                    { label: "Next 16 Hours", value: `${fmt(total/2, 0)} mL` }
                ],
                equation: `4 × ${kg}kg × ${tbsa}% = ${fmt(total)}mL`,
                notes: ["Use Lactated Ringer's Solution"]
            };
        }
    },
    {
        id: "map",
        category: "hemodynamics",
        title: "Mean Arterial Pressure",
        subtitle: "Organ Perfusion Check",
        iconName: "activity",
        staticEquation: "(SBP + 2(DBP)) ÷ 3",
        fields: [
            { key: "sbp", label: "Systolic BP", type: "number", min: 0, max: 300, step: 1, placeholder: "120", unit: "mmHg" },
            { key: "dbp", label: "Diastolic BP", type: "number", min: 0, max: 200, step: 1, placeholder: "80", unit: "mmHg" },
        ],
        compute: (inputs) => {
            const s = toNum(inputs.sbp);
            const d = toNum(inputs.dbp);
            if (s === null || d === null) return null;

            const map = (s + (2 * d)) / 3;
            return {
                primary: { label: "MAP", value: `${fmt(map, 0)} mmHg` },
                equation: `(${s} + 2(${d})) ÷ 3 = ${fmt(map)}`,
                notes: [map >= 65 ? "Normal Perfusion (≥65)" : "Low Perfusion (<65)"]
            };
        }
    },
    {
        id: "anc",
        category: "labs",
        title: "ANC (Neutrophil)",
        subtitle: "Infection Risk Level",
        iconName: "flask",
        staticEquation: "WBC × (%Segs + %Bands)",
        fields: [
            { key: "wbc", label: "WBC Count", type: "number", min: 0, max: 500000, step: 100, placeholder: "4500", unit: "/mm³" },
            { key: "segs", label: "Segmented %", type: "number", min: 0, max: 100, step: 1, placeholder: "40", unit: "%" },
            { key: "bands", label: "Bands %", type: "number", min: 0, max: 100, step: 1, placeholder: "5", unit: "%" },
        ],
        compute: (inputs) => {
            const w = toNum(inputs.wbc);
            const s = toNum(inputs.segs);
            const b = toNum(inputs.bands);
            if (w === null || s === null || b === null) return null;

            const anc = w * ((s + b) / 100);
            let risk = "Normal Risk";
            if (anc < 500) risk = "Severe Risk (Precautions!)";
            else if (anc < 1000) risk = "High Risk";
            else if (anc < 1500) risk = "Moderate Risk";

            return {
                primary: { label: "ANC", value: `${fmt(anc, 0)}` },
                equation: `${w} × (${s}% + ${b}%) = ${fmt(anc)}`,
                notes: [risk]
            };
        }
    },
    {
        id: "unitConverter",
        category: "conversions",
        title: "Universal Converter",
        subtitle: "Temp, Vol, Wgt, Len",
        iconName: "refresh",
        staticEquation: "Select Category",
        fields: [
            { 
                key: "category", 
                label: "Category", 
                type: "select", 
                options: [
                    { label: "Temperature", value: "temp" },
                    { label: "Volume", value: "vol" },
                    { label: "Weight", value: "weight" },
                    { label: "Length / Height", value: "length" },
                ]
            },
            { key: "val", label: "Value", type: "number", min: -500, max: 1000000, step: 0.01, placeholder: "0" },
            
            // Temperature Options
            { key: "from_temp", label: "From", type: "select", options: [{label: "Celsius", value: "c"}, {label: "Fahrenheit", value: "f"}], showIf: {key: "category", value: "temp"} },
            { key: "to_temp", label: "To", type: "select", options: [{label: "Fahrenheit", value: "f"}, {label: "Celsius", value: "c"}], showIf: {key: "category", value: "temp"} },

            // Volume Options
            { key: "from_vol", label: "From", type: "select", options: [{label: "Liters (L)", value: "L"}, {label: "Milliliters (mL)", value: "mL"}, {label: "cc", value: "cc"}, {label: "Ounces (oz)", value: "oz"}, {label: "Tablespoon (tbsp)", value: "tbsp"}, {label: "Teaspoon (tsp)", value: "tsp"}], showIf: {key: "category", value: "vol"} },
            { key: "to_vol", label: "To", type: "select", options: [{label: "Milliliters (mL)", value: "mL"}, {label: "Liters (L)", value: "L"}, {label: "cc", value: "cc"}, {label: "Ounces (oz)", value: "oz"}, {label: "Tablespoon (tbsp)", value: "tbsp"}, {label: "Teaspoon (tsp)", value: "tsp"}], showIf: {key: "category", value: "vol"} },

            // Weight Options
            { key: "from_weight", label: "From", type: "select", options: [{label: "Kilograms (kg)", value: "kg"}, {label: "Pounds (lb)", value: "lb"}, {label: "Grams (g)", value: "g"}, {label: "Milligrams (mg)", value: "mg"}, {label: "Micrograms (mcg)", value: "mcg"}], showIf: {key: "category", value: "weight"} },
            { key: "to_weight", label: "To", type: "select", options: [{label: "Pounds (lb)", value: "lb"}, {label: "Kilograms (kg)", value: "kg"}, {label: "Grams (g)", value: "g"}, {label: "Milligrams (mg)", value: "mg"}, {label: "Micrograms (mcg)", value: "mcg"}], showIf: {key: "category", value: "weight"} },

            // Length Options
            { key: "from_length", label: "From", type: "select", options: [{label: "Meters (m)", value: "m"}, {label: "Centimeters (cm)", value: "cm"}, {label: "Millimeters (mm)", value: "mm"}, {label: "Feet (ft)", value: "ft"}, {label: "Inches (in)", value: "in"}], showIf: {key: "category", value: "length"} },
            { key: "to_length", label: "To", type: "select", options: [{label: "Feet (ft)", value: "ft"}, {label: "Meters (m)", value: "m"}, {label: "Centimeters (cm)", value: "cm"}, {label: "Millimeters (mm)", value: "mm"}, {label: "Inches (in)", value: "in"}], showIf: {key: "category", value: "length"} },
        ],
        compute: (inputs) => {
            const val = toNum(inputs.val);
            const cat = inputs.category || 'temp';
            if (val === null) return null;

            if (cat === 'temp') {
                const from = inputs.from_temp || 'c';
                const to = inputs.to_temp || 'f';
                
                if (from === to) return { primary: { label: "Result", value: `${val} °${to.toUpperCase()}` } };

                let result = 0;
                let eq = "";
                if (from === 'c' && to === 'f') {
                    result = (val * 9/5) + 32;
                    eq = `(${val} × 1.8) + 32 = ${fmt(result)}`;
                } else {
                    result = (val - 32) * 5/9;
                    eq = `(${val} - 32) ÷ 1.8 = ${fmt(result)}`;
                }
                return { primary: { label: "Result", value: `${fmt(result, 1)} °${to.toUpperCase()}` }, equation: eq };
            }

            // Generic Unit Conversion (Volume, Weight, Length)
            const typeKey = cat === 'vol' ? 'vol' : cat === 'weight' ? 'weight' : 'length';
            const from = inputs[`from_${typeKey}`] || (cat === 'vol' ? 'L' : cat === 'weight' ? 'kg' : 'm');
            const to = inputs[`to_${typeKey}`] || (cat === 'vol' ? 'mL' : cat === 'weight' ? 'lb' : 'ft');

            if (from === to) return { primary: { label: "Result", value: `${val} ${to}` } };

            const baseFactorFrom = CONVERSION_FACTORS[from];
            const baseFactorTo = CONVERSION_FACTORS[to];

            // Convert to base unit then to target unit
            // Base units: Volume=mL, Weight=g, Length=m
            
            // NOTE: My conversion table was set up as (1 Unit = X Base), e.g. 1 L = 1000 mL
            // So: (Value * FactorFrom) / FactorTo
            
            const result = (val * baseFactorFrom) / baseFactorTo;
            
            return {
                primary: { label: "Result", value: `${fmt(result, 4)} ${to}` },
                equation: `${val} ${from} × (${baseFactorFrom}/${baseFactorTo}) = ${fmt(result, 4)}`,
            };
        }
    }
];
