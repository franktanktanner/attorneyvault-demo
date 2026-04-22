import { StatTile, type StatTileProps } from "../ui/StatTile";

export type KPITileProps = StatTileProps;

export function KPITile(props: KPITileProps) {
  return <StatTile {...props} />;
}
