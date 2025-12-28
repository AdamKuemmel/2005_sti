// Official Subaru WRX STI (2002-2007) maintenance schedule
// Based on factory service manual intervals
export const STI_MAINTENANCE_ITEMS = [
  // FLUIDS - High frequency
  {
    title: "Engine Oil Change",
    category: "fluid",
    description: "Replace engine oil and filter. Critical for turbo longevity.",
    intervalMiles: 3750, // Conservative for turbo engines
    intervalMonths: 4,
  },

  // FLUIDS - Medium frequency
  {
    title: "Transmission Fluid Change",
    category: "fluid",
    description:
      "Replace manual transmission fluid. More frequent under harsh driving.",
    intervalMiles: 30000,
    intervalMonths: null,
  },
  {
    title: "Front Differential Fluid Change",
    category: "fluid",
    description: "Replace front differential gear oil.",
    intervalMiles: 30000,
    intervalMonths: null,
  },
  {
    title: "Rear Differential Fluid Change",
    category: "fluid",
    description: "Replace rear differential gear oil.",
    intervalMiles: 30000,
    intervalMonths: null,
  },
  {
    title: "Engine Coolant Flush",
    category: "fluid",
    description: "Replace engine coolant. Use only Subaru Super Coolant.",
    intervalMiles: 30000,
    intervalMonths: 24,
  },
  {
    title: "Brake Fluid Flush",
    category: "fluid",
    description: "Replace brake fluid to prevent moisture contamination.",
    intervalMiles: null,
    intervalMonths: 24,
  },
  {
    title: "Power Steering Fluid Change",
    category: "fluid",
    description: "Replace power steering fluid.",
    intervalMiles: 30000,
    intervalMonths: null,
  },

  // ENGINE/DRIVETRAIN - Major services
  {
    title: "Timing Belt Replacement",
    category: "engine_drivetrain",
    description:
      "CRITICAL: Replace timing belt, idler pulleys, water pump, cam/crank seals. Engine interference design - belt failure causes catastrophic damage.",
    intervalMiles: 105000,
    intervalMonths: null,
  },
  {
    title: "Water Pump Replacement",
    category: "engine_drivetrain",
    description: "Replace during timing belt service.",
    intervalMiles: 105000,
    intervalMonths: null,
  },
  {
    title: "Spark Plugs Replacement",
    category: "engine_drivetrain",
    description:
      "Replace spark plugs. Use copper core plugs (NGK recommended).",
    intervalMiles: 60000,
    intervalMonths: null,
  },
  {
    title: "Serpentine Belt Inspection",
    category: "engine_drivetrain",
    description: "Inspect drive belt for wear and cracks.",
    intervalMiles: 30000,
    intervalMonths: null,
  },
  {
    title: "Fuel Filter Replacement",
    category: "engine_drivetrain",
    description: "Replace fuel filter (in-tank type on 2005 STI).",
    intervalMiles: 60000,
    intervalMonths: null,
  },

  // CONSUMABLES
  {
    title: "Air Filter Replacement",
    category: "consumable",
    description: "Replace engine air filter.",
    intervalMiles: 30000,
    intervalMonths: null,
  },
  {
    title: "Cabin Air Filter Replacement",
    category: "consumable",
    description: "Replace cabin/pollen filter.",
    intervalMiles: 15000,
    intervalMonths: 12,
  },
  {
    title: "Tire Rotation",
    category: "consumable",
    description: "Rotate and inspect tires for even wear.",
    intervalMiles: 7500,
    intervalMonths: null,
  },
  {
    title: "Brake Pad Inspection",
    category: "consumable",
    description: "Inspect brake pads and rotors for wear.",
    intervalMiles: 15000,
    intervalMonths: null,
  },

  // INSPECTIONS
  {
    title: "General Inspection",
    category: "inspection",
    description:
      "Inspect steering, suspension, clutch, brake lines, axle boots, parking brake.",
    intervalMiles: 15000,
    intervalMonths: 12,
  },
];
