import type { FC, ReactNode } from "react";

interface FolderProps {
  color?: string;
  size?: number;
  items?: ReactNode[];
  className?: string;
}

declare const Folder: FC<FolderProps>;
export default Folder;
