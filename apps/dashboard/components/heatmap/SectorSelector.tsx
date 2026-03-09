"use client";

import DropdownSelect from "@/components/shared/DropdownSelect";

interface SectorSelectorProps {
  selected: string;
  onChange: (sector: string) => void;
}

const SECTOR_OPTIONS = [
  { label: "Utilities (XLU)", value: "XLU" },
  { label: "Technology (XLK)", value: "XLK" },
  { label: "Energy (XLE)", value: "XLE" },
  { label: "Financials (XLF)", value: "XLF" },
  { label: "Health Care (XLV)", value: "XLV" },
  { label: "Consumer Disc. (XLY)", value: "XLY" },
  { label: "Communication (XLC)", value: "XLC" },
  { label: "Industrials (XLI)", value: "XLI" },
  { label: "Consumer Staples (XLP)", value: "XLP" },
  { label: "Materials (XLB)", value: "XLB" },
  { label: "Real Estate (XLRE)", value: "XLRE" },
];

export default function SectorSelector({ selected, onChange }: SectorSelectorProps) {
  return (
    <DropdownSelect
      options={SECTOR_OPTIONS}
      value={selected}
      onChange={onChange}
    />
  );
}
