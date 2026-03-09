export interface TreemapNode {
  symbol: string;
  name: string;
  subIndustry: string;
  marketCap: number;
  changePercent: number;
}

export interface SectorHeatmapData {
  sectorName: string;
  nodes: TreemapNode[];
}
