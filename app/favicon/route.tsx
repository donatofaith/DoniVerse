import { ImageResponse } from "next/og";
import DoniVerseAppIcon from "@/components/DoniVerseAppIcon";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(<DoniVerseAppIcon />, {
    width: 64,
    height: 64,
  });
}
