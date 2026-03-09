"use client";

import styles from "./IndexFilter.module.css";
import DropdownSelect from "@/components/shared/DropdownSelect";

interface IndexFilterProps {
  selected: string;
  onChange: (value: string) => void;
}

const INDEX_OPTIONS = [
  { label: "Nasdaq 100 (Technology)", value: "ndx" },
  { label: "S&P 500", value: "spx" },
  { label: "Russell 2000", value: "rut" },
  { label: "Dow 30", value: "djia" },
];

export default function IndexFilter({ selected, onChange }: IndexFilterProps) {
  return (
    <div className={styles.container}>
      <DropdownSelect
        options={INDEX_OPTIONS}
        value={selected}
        onChange={onChange}
      />
    </div>
  );
}
